import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { connect } from "@/lib/DB_Connect";
import Server from "@/models/Server.model";
import Channel from "@/models/Channel.model"; // Import the Channel model
import User from "@/models/User.model";
import jwt, { JwtPayload } from "jsonwebtoken";

interface ChannelRequest {
    name: string;
    type: "TEXT" | "AUDIO" | "VIDEO" | "FORUM" | "THREAD";
    topic?: string;
    position?: number;
    isNSFW?: boolean;
    parentId?: string;
    permissionOverrides?: Array<{
        id: string;
        type: "role" | "member";
        allow: string;
        deny: string;
    }>;
    slowMode?: number;
}

export async function POST(request: NextRequest) {
    await connect();

    try {
        // Parse request body
        const body = await request.json();
        const {
            name,
            type = "TEXT",
            topic,
            position = 0,
            isNSFW = false,
            parentId,
            permissionOverrides = [],
            slowMode = 0,
        }: ChannelRequest = body;

        // Get server ID from request
        const serverId = body.serverId;
        if (!serverId) {
            return NextResponse.json({ message: "Server ID is required" }, { status: 400 });
        }

        // Validate required fields
        if (!name || !type) {
            return NextResponse.json({ message: "Name and type are required" }, { status: 400 });
        }

        // Get user ID from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is the server owner or has admin permissions
        const server = await Server.findById(serverId);
        if (!server) {
            return NextResponse.json({ message: "Server not found" }, { status: 404 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!decoded || typeof decoded === "string" || !decoded.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await User.findById(decoded.id).select('-password');
        const userId = user?._id;


        // Check if user is server owner or admin
        if (server.ownerId !== userId) {  
            // Check for admin role if not owner
            // This is a simplified check - you might have a more complex permission system
            interface ServerMember {
                userId: string;
                isAdmin: boolean;
            }

          
        }

        // Prepare channel data
        const channelData = {
            name,
            server: serverId,
            type,
            topic,
            position,
            isNSFW,
            parentId: parentId ? parentId : undefined,
            permissionOverrides: permissionOverrides.map(override => ({
                id: override.id,
                type: override.type,
                allow: override.allow,
                deny: override.deny
            })),
            slowMode
        };

        // Create new channel
        const newChannel = await Channel.create(channelData);

        // Update server with new channel
        await Server.findByIdAndUpdate(
            serverId,
            { $push: { channels: newChannel._id } },
            { new: true }
        );

        return NextResponse.json({
            message: "Channel created successfully",
            channel: newChannel
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating channel:", error);
        return NextResponse.json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}