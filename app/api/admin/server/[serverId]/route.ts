import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/lib/DB_Connect";
import Server from "@/models/Server.model";
import Channel from "@/models/Channel.model";

export async function GET(request: NextRequest, { params }: { params: { serverId: string } }) {
    await connect();
    try {
        const { serverId } = params;
        console.log("Fetching server with ID:", serverId); // Debugging log

        const server = await Server.findById(serverId)
        const channels = await Channel.find({ _id: { $in: server.channels } });
        console.log(channels)

        channels.forEach(channel => {
          console.log(channel.type);
        });
        const responseData = {
            server, 
            channels
        }
        if (!server) {
            console.error("Server not found for ID:", serverId); // Debugging log
            return NextResponse.json(
                { error: "Server not found" },
                { status: 404 }
            );
        }

        console.log("Server found:", server); // Debugging log
        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("Error fetching server:", error); // Log detailed error
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

function populate(arg0: string) {
    throw new Error("Function not implemented.");
}
