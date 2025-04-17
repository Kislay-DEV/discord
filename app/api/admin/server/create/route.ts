import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server.model";
import Role from "@/models/Role.model";
import { connect } from "@/lib/DB_Connect";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import rateLimiter from "@/lib/rateLimit";
import { v4 as uuidv4 } from "uuid"; // Add this import for generating unique invite codes

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
  userRole: {
    id: string;
    name: string;
  };
}

// Define admin permissions - full access
const ADMIN_PERMISSIONS = '2199023255551'; // Represents all permission bits set to 1
// Define default user permissions - basic access
const USER_PERMISSIONS = '104324673'; // Basic permissions for regular users

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

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create server with default settings
      const server = await Server.create([{
        name,
        imageUrl,
        owner: ownerId,
        members: [{
          user: ownerId,
          roles: [], // We'll add the admin role ID after creating it
          joinedAt: new Date()
        }],
        invites: [{
          code: uuidv4(), // Generate a unique invite code
          creator: ownerId,
          uses: 0,
          maxUses: 0
        }],
        settings: {
          defaultPermissions: '0',
          verificationLevel: 'NONE',
          isPrivate: false
        },
        template,
        categories: template !== 'CUSTOM' ? getDefaultCategories(template) : []
      }], { session });
      
      const createdServer = server[0];

      // Create admin role
      const adminRole = await Role.create([{
        user: ownerId,
        name: 'Admin',
        server: createdServer._id,
        color: '#e91e63', // Admin pink color
        permissions: ADMIN_PERMISSIONS,
        position: 1, // Highest position
        hoist: true, // Display separately in member list
        mentionable: true
      }], { session });

      // Create default user role
      const userRole = await Role.create([{
        user:ownerId,
        name: '@everyone',
        server: createdServer._id,
        color: '#99aab5', // Default gray color
        permissions: USER_PERMISSIONS,
        position: 0, // Lowest position
        hoist: false,
        mentionable: false
      }], { session });

      const createdAdminRole = adminRole[0];
      const createdUserRole = userRole[0];

      // Update server to include both roles
      createdServer.roles.push(createdAdminRole._id, createdUserRole._id);
      
      // Update the owner's member entry to include both admin and user roles
      createdServer.members[0].roles.push(createdAdminRole._id, createdUserRole._id);

      // Mark the owner as an admin by assigning the admin role
      createdServer.members[0].isAdmin = true; // Add this field to indicate admin status
      
      await createdServer.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Prepare sanitized response
      const response: IServerResponse = {
        id: createdServer._id.toString(),
        name: createdServer.name,
        imageUrl: createdServer.imageUrl,
        ownerId: createdServer.owner.toString(),
        createdAt: createdServer.createdAt,
        updatedAt: createdServer.updatedAt,
        memberCount: createdServer.members.length,
        template: createdServer.template,
        adminRole: {
          id: createdAdminRole._id.toString(),
          name: createdAdminRole.name
        },
        userRole: {
          id: createdUserRole._id.toString(),
          name: createdUserRole.name
        }
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      // Abort transaction in case of error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

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
