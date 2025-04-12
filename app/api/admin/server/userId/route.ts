import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/lib/DB_Connect";
import Server from "@/models/Server.model";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    await connect();
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user")?.value;
        const user = userCookie ? JSON.parse(userCookie) : null;
        const userId = user?.id;

        if (!userId) {
            console.error("Unauthorized: User ID not found"); // Debugging log
            return NextResponse.json(
                { error: "Unauthorized: User ID not found" },
                { status: 401 }
            );
        }

        console.log("Fetching servers for userId:", userId); // Debugging log
        const servers = await Server.find({ "members.user": userId });
        console.log("Servers found:", servers); // Debugging log

        return NextResponse.json(
            { servers },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching servers:", error); // Log detailed error
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}