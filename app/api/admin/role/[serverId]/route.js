import { NextRequest,NextResponse } from "next/server"
import Role from "@/models/Role.model"
import Server  from "@/models/Server.model"
import User from "@/models/User.model"

export async function GET(req){
    const {searchParams} = new URL(req.url)
    const serverId = searchParams.get('serverId')
    const server = await Server.findById(serverId).populate('roles').populate('members')
    const roles = server.roles
    const members = server.members
    return NextResponse.json({roles,members})
}