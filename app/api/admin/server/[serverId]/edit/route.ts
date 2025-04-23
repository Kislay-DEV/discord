import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/DB_Connect";
import Server from "@/models/Server.model";
import { cookies } from "next/headers";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { serverId: string } }
) {
    await connect();

    const { serverId } = await params;
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const user = userCookie ? JSON.parse(userCookie.value) : null;
    const userId = user?.id;


    // Validate required parameters
    if (!serverId || !userId) {
        return NextResponse.json(
            { error: "Server ID and User ID are required" },
            { status: 400 }
        );
    }

    try {
        const { name, imageUrl } = await request.json();

        // Validate request body
        if (!name || !imageUrl) {
            return NextResponse.json(
                { error: "Name and Image URL are required" },
                { status: 400 }
            );
        }

        const server = await Server.findByIdAndUpdate(serverId, {
            $set: {
                name: name,
                imageUrl: imageUrl
            }
        }, { new: true });

        if (!server) {
            return NextResponse.json(
                { error: "Server not found" },
                { status: 404 }
            );
        }

        // Check ownership
        if (server.owner.toString() !== userId) {
            return NextResponse.json(
                { error: "You are not the owner of this server" },
                { status: 403 }
            );
        }

        

        return NextResponse.json(
            { message: "Server updated successfully", server },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating server:", error);
        return NextResponse.json(
            { error: "Something went wrong", details: error.message },
            { status: 500 }
        );
    }
}
