import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server.model";
import User from "@/models/User.model";
import { connect } from "@/lib/DB_Connect";

export async function GET(request: NextRequest, { params }: { params: { serverId: string } }) {
    await connect()
    try {
        const serverId = params.serverId
        if (!serverId) {
            return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
        }
        
        // Get server with members and populate all user fields
        const serverWithMembers = await Server.findById(serverId)
            .populate({
                path: 'members.user',
                model: 'User',
                // Remove the select property entirely to get all fields
            });
        
        if (!serverWithMembers) {
            return NextResponse.json({ error: "Server not found" }, { status: 404 })
        }
        
        const members = serverWithMembers.members;
        
        if (!members || members.length === 0) {
            return NextResponse.json({ error: "No members found" }, { status: 404 })
        }
        
        return NextResponse.json({ members }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
    }
}