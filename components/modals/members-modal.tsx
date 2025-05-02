"use client"
import { useForm } from "react-hook-form"
import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"
import qs from "query-string"

import { useModal } from "@/hooks/use-model-store"
import { ScrollArea } from "@radix-ui/react-scroll-area";

import { UserAvatar } from "../UserAvatar";
import { ShieldAlert, ShieldCheck, Crown, MoreVertical, ShieldQuestion, Shield, Check, Gavel, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { set } from "mongoose";

// Define the role icon mapping based on role names
const roleIconMap: Record<string, JSX.Element> = {
  "Member": <ShieldCheck className="h-4 w-4 ml-2 text-blue-500" />,
  "Admin": <ShieldCheck className="h-4 w-4 ml-2 text-red-500" />,
  "Owner": <Crown className="h-4 w-4 ml-2 text-yellow-500" />,
  "Moderator": <ShieldCheck className="h-4 w-4 ml-2 text-green-500" />,
  "Guest": <Shield className="h-4 w-4 ml-2 text-gray-500" />
};


type Member = {
  user: {
    email: string;
    _id: string;
    username: string;
    avatar?: string;
  };
  email: string;
  roles: string[];
  joinedAt: string;
  _id: string;
};

// Match your Role model structure
type ServerRole = {
  _id: string;
  user: string;  // User ID
  name: string;  // Role name
  server: string;
  color: string;
  position: number;
};

export default function MembersModal() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([]);
  const [serverRoles, setServerRoles] = useState<ServerRole[]>([]);
  const [loadingId, setLoadingId] = useState("")
  const { isOpen, onClose, onOpen, type, data } = useModal();
  const { server } = data;

  const isModalOpen = isOpen && type === "members";

  const onRoleChange = async (memberId: string, role: string) => {
    try {
      console.log(memberId, role)
      setLoadingId(memberId);
      const url = `/api/admin/member/${memberId}`;
      const query = qs.stringify({ role }, { skipNull: true });
      const serverId = server?._id || data?.server?._id;

      const response = await axios.patch(url, { role, serverId });
      console.log(response.data)
      router.refresh();
      onOpen("members", { server });

    } catch (error) {
      console.log(error)
    } finally {
      setLoadingId("")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!server?._id) return;

      try {
        console.log(server._id)
        const memberResponse = await axios.get(`/api/admin/server/${server._id}/members`);
        setMembers(memberResponse.data.members || []);

        const rolesResponse = await axios.get(`/api/admin/server/${server._id}/role`);
        console.log(rolesResponse.data.serverRole)
        // Make sure we're extracting the right data structure
        setServerRoles(rolesResponse.data.serverRole || []);
        console.log("Server roles:", rolesResponse.data.serverRole);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMembers([]);
        setServerRoles([]);
      }
    };

    if (isModalOpen) {
      fetchData();
    }
  }, [server, isModalOpen]);

  // Function to get roles for a specific user
  const getUserRoles = (userId: string) => {
    return serverRoles.filter(role => role.user === userId);
  };

  // Function to check if a user has a specific role
  const hasRole = (userId: string, roleName: string) => {
    return serverRoles.some(role => role.user === userId && role.name === roleName);
  };

  // Function to get a role's icon
  const getRoleIcon = (roleName: string) => {
    // Try direct match first
    if (roleIconMap[roleName]) {
      return roleIconMap[roleName];
    }

    // Try case-insensitive match
    const normalizedName = roleName.toLowerCase();
    for (const key in roleIconMap) {
      if (key.toLowerCase() === normalizedName) {
        return roleIconMap[key];
      }
    }

    return null;
  };

  const handleClose = () => {
    onClose();
  };

  // Check if a member is the server owner
  const isServerOwner = (memberId: string) => {
    return server?.owner?.toString() === memberId;
  };

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      <div className="fixed top-28 left-[580px] transform -translate-x-1/2 z-50">
        <div className="border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100 max-h-[90vh] overflow-y-auto relative">
          <button
            title="Close"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-100">Server Members</h2>
            <div className="p-2 w-96">
              <span className="text-zinc-500">
                {members.length} Members
              </span>
            </div>
          </div>

          <ScrollArea className="mt-8 max-h-[420px] pr-6">
            {members.map((member) => {
              const userRoles = getUserRoles(member.user._id);
              const isOwner = isServerOwner(member.user._id);

              return (
                <div key={member._id} className="flex items-center gap-x-2 mb-6">
                  <UserAvatar
                    src={member.user.avatar}
                    name={member.user.username}
                    className="object-cover rounded-full h-10 w-10"
                  />

                  <div className="flex flex-col gap-y-1">
                    <div className="text-sm font-semibold flex items-center">
                      {member.user.username}

                      {/* Display roles for this user */}
                      {userRoles.map((role) => (
                        <span key={role._id} style={{ color: role.color || undefined }} className="flex items-center">
                          {getRoleIcon(role.name) || (
                            <span className="ml-2 text-xs">{role.name}</span>
                          )}
                        </span>
                      ))}

                      {/* Show Crown icon for server owner */}
                      {isOwner && (
                        <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {member.user.email}
                    </p>

                  </div>
                  {/* Only show dropdown menu if user is not the server owner */}
                  {server?.members?.some((id) => id.user === member.user._id) && !isOwner && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" >
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="w-4 h-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => onRoleChange(member._id, "Guest")}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Guest
                                  {hasRole(member._id, "Guest") && (
                                    <Check className="h-4 w-4 ml-auto text-green-500" />
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onRoleChange(member._id, "Moderator")}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Moderator
                                  {hasRole(member._id, "Moderator") && (
                                    <Check className="h-4 w-4 ml-auto text-green-500" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Gavel className="h-4 w-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  {loadingId === member._id && (
                    <Loader2 className="animate-spin h-4 w-4 ml-auto text-gray-500" />
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </div>
    </>
  )
}