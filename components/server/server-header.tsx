"use client";
import { Server } from "@/schema/Server.schema";
import { Role } from "@/schema/Role.schema";

interface ServerHeaderProps {
  server: Server;
  role?: Role;
}

export const ServerHeader = ({
  server,
  role,
}: ServerHeaderProps) => {
  const isAdmin = role?.name === "ADMIN";
  const isModerator = role?.name === "MODERATOR";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{server.name}</h1>
        <p className="text-sm text-muted-foreground ml-2">
          {role ? role.name : "Member"}
        </p>
      </div>
      <div>
        <p className="text-sm">
          Role: {isAdmin ? "Admin" : isModerator ? "Moderator" : "Member"}
        </p>
      </div>
    </div>
  );
};