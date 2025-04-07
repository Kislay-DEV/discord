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
            return NextResponse.json(
                { error: "Unauthorized: User ID not found" },
                { status: 401 }
            );
        }
        console.log(userId)

        // Find servers where the userId is in the members array
        const servers = await Server.find({ "members.user": userId });
        console.log(servers)
        return NextResponse.json(
            { servers },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching servers:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}