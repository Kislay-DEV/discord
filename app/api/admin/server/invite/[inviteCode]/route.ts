import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server.model";
import { connect } from "@/lib/DB_Connect";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest, context: { params: Promise<{ inviteCode: string }> }) {
    await connect();
    try {
        const params = await context.params; // Await the params object
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const user = userCookie ? JSON.parse(userCookie.value) : null;
        const ownerId = user?.id;
        console.log(ownerId)

        // Use dot notation to find the invite code in the invites array
        const server = await Server.findOne({ "invites.code": params.inviteCode });

        if (!server) {
            return NextResponse.json({ error: "Server not found" }, { status: 400 });
        }

        const isMember = server.members.some((member: any) => member.user.toString() === ownerId);
        if (!isMember) {
            const updatedServer = await Server.findByIdAndUpdate(
                server._id,
                { $push: { members: { user: ownerId, role: "member" } } },
                { new: true }
            );
            return NextResponse.json({ server: updatedServer }, { status: 200 });
        }
        return NextResponse.json("You are already a member of this server", { status: 409 });

    } catch (error: any) {
        return NextResponse.json("Something went wrong: " + error, { status: 500 });
    }
}