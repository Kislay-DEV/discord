// app/api/servers/[serverId]/leave/route.ts
import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server.model";
import Role from "@/models/Role.model";
import { cookies } from "next/headers";
import { connect } from "@/lib/DB_Connect";
import { PERMISSIONS } from "@/lib/permissions";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function PATCH(req: NextRequest, { params }: { params: { serverId: string } }) {
    await connect();
    try {
        const { serverId } = params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
       
           if (!token) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
           }
       
           const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
       
           if (!decoded || typeof decoded === "string" || !decoded.id) {
             return NextResponse.json({ error: "Invalid token" }, { status: 401 });
           }
           const userId = decoded.id;

        // Find server and populate necessary data
        const server = await Server.findById(serverId)
            .populate('owner')
            .populate('members.user')
            .populate('members.roles');

        if (!server) {
            return NextResponse.json({ message: "Server not found" }, { status: 404 });
        }

        // Check if user is a member
        const member = server.members.find((m: any) => m.user._id.toString() === userId);
        if (!member) {
            return NextResponse.json({ message: "You are not a member of this server" }, { status: 403 });
        }

        // Check if user is the owner
        if (server.owner._id.toString() === userId) {
            return NextResponse.json(
                { message: "Server owners cannot leave. Transfer ownership or delete the server first." },
                { status: 403 }
            );
        }

        // Check if user has admin role (optional additional check)
        const isAdmin = member.roles.some((role: any) => 
            BigInt(role.permissions) & PERMISSIONS.ADMINISTRATOR
        );
        
        if (isAdmin) {
            return NextResponse.json(
                { message: "Admins cannot leave the server. Remove admin role first." },
                { status: 403 }
            );
        }

        // Remove user from server members
        server.members = server.members.filter((m: any) => m.user._id.toString() !== userId);
        await server.save();

        // Remove user from any roles they had
        await Role.updateMany(
            { server: serverId, users: userId },
            { $pull: { users: userId } }
        );

        return NextResponse.json(
            { message: "Successfully left the server" },
            { status: 200 }
        );
    } catch (error) {
        console.error("server leave error", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}