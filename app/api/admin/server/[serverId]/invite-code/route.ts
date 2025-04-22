import { NextResponse, NextRequest } from "next/server";
import Server from "@/models/Server.model";
import { connect } from "@/lib/DB_Connect";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  await connect();
  try {
    const serverId = params.serverId;

    if (!serverId) {
      return NextResponse.json({ error: "Missing serverId" }, { status: 400 });
    }

    const inviteCode = uuidv4();

    // Update the server's invites array with the new code (replace all invites)
    const updatedServer = await Server.findByIdAndUpdate(
      serverId,
      { invites: [{ code: inviteCode }] },
      { new: true }
    );

    if (!updatedServer) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    return NextResponse.json({ inviteCode }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}