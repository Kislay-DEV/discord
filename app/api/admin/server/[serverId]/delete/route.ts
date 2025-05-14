import { NextResponse, NextRequest } from "next/server";
import Server from "@/models/Server.model";
import {connect} from "@/lib/DB_Connect"
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest, { params }: { params: { serverId: string } }) {
  const { serverId } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connect();
    const server = await Server.findByIdAndDelete(serverId);

    if (!server) {
      return NextResponse.json({ message: "Server not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Server deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting server:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}