import { NextResponse, NextRequest } from "next/server";
import Role from "@/models/Role.model";
import {connect} from "@/lib/DB_Connect";
import Server from "@/models/Server.model";

export async function PATCH(request: NextRequest, { params }: { params: { memberId: string } }) {
  const { memberId } = params;
  
  try {
    // Connect to database
    await connect();
    
    // Parse the request body
    const body = await request.json();
    const { role, serverId } = body;
    

    
    
    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }
    
    // If role is a string (role name), find or create the role
    if (typeof role === "string") {
      // First check if the role already exists for this user in this server
      let userRole = await Role.findOne({ 
        server: serverId,
        name: role,
        user: memberId
      });
      
        const highestRole = await Role.findOne({ server: serverId })
          .sort({ position: -1 })
          .limit(1);
          
        const newPosition = highestRole ? highestRole.position + 1 : 0;
        
        // Create a new role
        if (!userRole) {
          userRole = new Role({
            user: memberId,
            name: role,
            server: serverId,
            position: newPosition,
            // Set default values for other fields
            color: role === "Moderator" ? "#57F287" : "#99AAB5", // Green for Moderator, default gray for others
            permissions: role === "Moderator" ? "8" : "0", // Basic permissions for Moderator, none for Guest
          });
        } else {
          // If the role already exists, update its position
          userRole.position = newPosition;
        }
      
        await userRole.save();
      
      
      return NextResponse.json(userRole, { status: 200 });
    } 
    // If role is an object, update existing role
    else if (typeof role === "object" && role._id) {
      const updatedRole = await Role.findByIdAndUpdate(
        role._id, 
        { user: memberId },
        { new: true }
      );
      
      if (!updatedRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      const server = await Server.findById(serverId);
      if (!server) {
        return NextResponse.json({ error: "Server not found" }, { status: 404 });
      }
      
      return NextResponse.json(server, { status: 200 });
    }
    
    return NextResponse.json({ error: "Invalid role data" }, { status: 400 });
 console.log(role)

  
    
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}






export async function DELETE(request: NextRequest, { params }: { params: { memberId: string } }) {
  const { memberId } = params;
  try {
    await connect();
    const body = await request.json();
    const { serverId } = body;

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }
    
    // Remove the member from the array
    server.members = server.members.filter(
      (member: { _id: string }) => member._id.toString() !== memberId
    );
    
    // Defensive: Remove invites missing creator (optional, for your previous error)
    if (server.invites && server.invites.length > 0) {
      server.invites = server.invites.filter((invite: { creator: string }) => invite.creator);
    }
    
    await server.save();
    
    // Optionally, remove all roles for this user in this server
    await Role.deleteMany({ user: memberId, server: serverId });
    
    return NextResponse.json(server, { status: 200 });

  } catch (error) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Failed to kick member" }, { status: 500 });
  }
}