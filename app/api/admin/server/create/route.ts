import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server.model";
import Role from "@/models/Role.model";
import { connect } from "@/lib/DB_Connect";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import rateLimiter from "@/lib/rateLimit";

// Type definitions
interface IServerRequest {
  name: string;
  imageUrl: string;
  template?: 'GAMING' | 'EDUCATION' | 'COMMUNITY' | 'CUSTOM';
}

interface IServerResponse {
  id: string;
  name: string;
  imageUrl: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  template: string;
  adminRole: {
    id: string;
    name: string;
  };
}

// Define admin permissions - full access
const ADMIN_PERMISSIONS = '2199023255551'; // Represents all permission bits set to 1

export async function POST(request: NextRequest) {
  await connect();

  try {
    // Validate request body
    const { name, imageUrl, template = 'CUSTOM' }: IServerRequest = await request.json();

    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const user = userCookie ? JSON.parse(userCookie) : null;
    const ownerId = user?.id;

    if (!ownerId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID not found" },
        { status: 401 }
      );
    }

    // Validate inputs
    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: "Name and imageUrl are required fields" },
        { status: 400 }
      );
    }

    if (name.length > 100 || name.length < 2) {
      return NextResponse.json(
        { error: "Server name must be between 2-100 characters" },
        { status: 400 }
      );
    }

    if (!['GAMING', 'EDUCATION', 'COMMUNITY', 'CUSTOM'].includes(template)) {
      return NextResponse.json(
        { error: "Invalid server template" },
        { status: 400 }
      );
    }

    // Enhanced URL validation
    try {
      new URL(imageUrl);
      if (!['http:', 'https:'].includes(new URL(imageUrl).protocol)) {
        throw new Error();
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid image URL format. Must be http/https URL" },
        { status: 400 }
      );
    }

    // Check for existing server with same name (case insensitive)
    const existingServer = await Server.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingServer) {
      return NextResponse.json(
        { error: "Server with this name already exists" },
        { status: 409 }
      );
    }

    // Create server with default settings first
    const server = await Server.create({
      name,
      imageUrl,
      owner: ownerId,
      members: [{
        user: ownerId,
        roles: [], // We'll update this after creating the admin role
        joinedAt: new Date()
      }],
      invites: [],
      settings: {
        defaultPermissions: '0',
        verificationLevel: 'NONE',
        isPrivate: false
      },
      template,
      categories: template !== 'CUSTOM' ? getDefaultCategories(template) : []
    });
    
    // Now create admin role
    const adminRole = await Role.create({
      name: 'Admin',
      server: server._id,
      color: '#e91e63', // Admin pink color
      permissions: ADMIN_PERMISSIONS,
      position: 1, // Highest position
      hoist: true, // Display separately in member list
      mentionable: true
    });

    // Update server to include the role and update owner's roles
    server.roles.push(adminRole._id);
    server.members[0].roles.push(adminRole._id);
    await server.save();

    // Prepare sanitized response
    const response: IServerResponse = {
      id: server._id.toString(),
      name: server.name,
      imageUrl: server.imageUrl,
      ownerId: server.owner.toString(),
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      memberCount: server.members.length,
      template: server.template,
      adminRole: {
        id: adminRole._id.toString(),
        name: adminRole.name
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("Server creation error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function for template-based default categories
function getDefaultCategories(template: string): any[] {
  const defaults: Record<string, any[]> = {
    GAMING: [
      { name: "Text Channels", position: 0, channels: [] },
      { name: "Voice Channels", position: 1, channels: [] },
      { name: "Game Lobbies", position: 2, channels: [] }
    ],
    EDUCATION: [
      { name: "Lectures", position: 0, channels: [] },
      { name: "Study Groups", position: 1, channels: [] },
      { name: "Resources", position: 2, channels: [] }
    ],
    COMMUNITY: [
      { name: "General", position: 0, channels: [] },
      { name: "Announcements", position: 1, channels: [] },
      { name: "Events", position: 2, channels: [] }
    ]
  };

  return defaults[template] || [];
}