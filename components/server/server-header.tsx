// server-header.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useModal } from "@/hooks/use-model-store";
import { PERMISSIONS } from "@/lib/permissions";

interface Role {
  _id: string;
  user: string;
  name: string;
  server: string;
  color: string;
  permissions: string;
  position: number;
}

interface ServerHeaderProps {
  servers: any;
  role: any;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({ servers, role }) => {
  
  const { serverId } = useParams();
  const [roles, setRoles] = useState<Role[]>([]);
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { onOpen } = useModal();

  useEffect(() => {
    if (!serverId) return;

    const fetchData = async () => {
      try {
        const [rolesResponse, serverResponse] = await Promise.all([
          axios.get(`/api/admin/server/${serverId}/role`),
          axios.get(`/api/admin/server/${serverId}`)
        ]);

        if (rolesResponse.data?.serverRole) {
          setRoles(rolesResponse.data.serverRole);
        }
        
        if (serverResponse.data?.server) {
          setServer(serverResponse.data.server);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId]);

  // Check permissions using the bitfield system
  const hasPermission = (permission: bigint): boolean => {
    return roles.some(role => {
      try {
        const rolePerms = BigInt(role.permissions);
        // If ADMINISTRATOR flag is set, has all permissions
        if ((rolePerms & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR) {
          return true;
        }
        return (rolePerms & permission) === permission;
      } catch {
        return false;
      }
    });
  };

  // Permission checks
  const canInvite = hasPermission(PERMISSIONS.CREATE_INVITE);
  const canManageChannels = hasPermission(PERMISSIONS.MANAGE_CHANNELS);
  const canManageServer = hasPermission(PERMISSIONS.MANAGE_SERVER);
  const canManageMembers = hasPermission(PERMISSIONS.MANAGE_MEMBERS);
  const isAdmin = hasPermission(PERMISSIONS.ADMINISTRATOR);
  const isModerator = hasPermission(PERMISSIONS.MANAGE_ROLES);

  if (!serverId) {
    return <p>Server ID is missing. Unable to fetch data.</p>;
  }

  if (loading || !server) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" asChild>
          <button
            className="w-full text-md font-semibold px-3 flex items-center border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
          >
            {server.name || "Server"}
            <ChevronDown className="h-5 w-5 ml-auto"/>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
          {/* Invite People */}
          {canInvite && (
            <DropdownMenuItem 
              onClick={() => onOpen("invite", { server })} 
              className="text-indigo-600 dark:text-indigo-400 px-3 py-3 text-sm cursor-pointer"
            >
              Invite People
              <UserPlus className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          )}
          
          {/* Server Settings */}
          {canManageServer && (
            <DropdownMenuItem 
              onClick={() => onOpen("editServer", { server })}
              className="px-3 py-3 text-sm cursor-pointer"
            >
              Server Settings
              <Settings className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          )}
          
          {/* Manage Members */}
          {canManageMembers && (
            <DropdownMenuItem 
              onClick={() => onOpen("members", { server })}
              className="px-3 py-3 text-sm cursor-pointer"
            >
              Manage Members
              <Users className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          )}
          
          {/* Create Channel */}
          {canManageChannels && (
            <DropdownMenuItem
              onClick={() => onOpen("createChannel", { server })}
              className="px-3 py-3 text-sm cursor-pointer"
            >
              Create Channel
              <PlusCircle className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          )}
          
          {/* Separator */}
          {(canInvite || canManageServer || canManageMembers || canManageChannels) && (
            <DropdownMenuSeparator/>
          )}
          
          {/* Delete Server - Admin only */}
          {isAdmin && (
            <DropdownMenuItem 
              className="text-rose-500 px-3 py-3 text-sm cursor-pointer"
              onClick={() => onOpen("deleteServer", { server })}
            >
              Delete Server
              <Trash className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          )}
          
          {/* Leave Server - Non-admins only */}
         
            <DropdownMenuItem 
              className="text-rose-500 px-3 py-3 text-sm cursor-pointer"
              onClick={() => onOpen("leaveServer", { server })}
            >
              Leave Server
              <LogOut className="h-4 w-4 ml-auto"/>
            </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};