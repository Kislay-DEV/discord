import Role from "@/models/Role.model"
import { NextRequest, NextResponse } from "next/server"
import { connect } from "@/lib/DB_Connect"

export async function GET(request: NextRequest, { params }: { params: { serverId: string } }) {
    await connect()
    try {
        const {serverId} = params
        if (!serverId) {
            return NextResponse.json({error: "Server ID is required"}, {status: 400})
        }

        const serverRole = await Role.find({ server: serverId })
        if(!serverRole){
            return NextResponse.json({error: "Server not found"}, {status: 404})
        
        }

        return NextResponse.json({serverRole},{status:200})
    } catch (error:any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}