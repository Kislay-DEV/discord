
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams for accessing route params
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useModal } from "@/hooks/use-model-store";


interface Role {
  _id: string;
  user: string;
  name: string;
  server: string;
  color: string;
  permissions: string;
}

export const ServerHeader = () => {
  const { serverId } = useParams(); // Extract serverId from the URL params
  const [roles, setRoles] = useState<Role[]>([]); // Store all roles
  const [serverName, setServerName] = useState<string>(""); // Optional: Fetch server name if needed
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState()

  const {onOpen} = useModal();

  useEffect(() => {
    if (!serverId) return; // Ensure serverId is available before making the API call

    const fetchRoles = async () => {
      try {
        const response = await axios.get(`/api/admin/server/${serverId}/role`);
        if (response.data && response.data.serverRole) {
          console.log(response.data.serverRole);
          setRoles(response.data.serverRole); // Set all roles in state
        }
        const serverResponse = await axios.get(`/api/admin/server/${serverId}`)
        if(serverResponse.data){
          setServer(serverResponse.data.server)
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [serverId]);

  const adminRole = roles.find((role) => role.name === "Admin");
  const everyoneRole = roles.find((role) => role.name === "@everyone");

  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)
  console.log(server)

  if (!serverId) {
    return <p>Server ID is missing. Unable to fetch roles.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
  <DropdownMenuTrigger className="focus:outline-none" asChild>
    {/* Ensure this button is the only child */}
    <button
      className="w-full text-md font-semibold px-3 flex items-center border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
    >
      {serverName || "Server"}
      <ChevronDown className="h-5 w-5 ml-auto"/>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 spaxe-y-[2px]">
    {everyoneRole &&(
      <DropdownMenuItem onClick={()=>onOpen("invite", {server})} className="text-indigo-600 dark:text-indigo-400 px-3 py-3 text-sm cursor-pointer">
        Invite People
        <UserPlus className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    {adminRole &&(
      <DropdownMenuItem className=" px-3 py-3 text-sm cursor-pointer">
        Server Settings
        <Settings className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    {adminRole &&(
      <DropdownMenuItem className=" px-3 py-3 text-sm cursor-pointer">
        Manage Members
        <Users className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    {everyoneRole &&(
      <DropdownMenuItem className=" px-3 py-3 text-sm cursor-pointer">
        Create Channel
        <PlusCircle className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    {adminRole &&(
      <DropdownMenuSeparator/>
    )}
    {adminRole &&(
      <DropdownMenuItem className="text-rose-500 px-3 py-3 text-sm cursor-pointer">
        Delete Server
        <Trash className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    {!adminRole &&(
      <DropdownMenuItem className="text-rose-500 px-3 py-3 text-sm cursor-pointer">
        Leave Server
        <LogOut className="h-4 w-4 ml-auto"/>
      </DropdownMenuItem>
    )}
    
   
  </DropdownMenuContent>
</DropdownMenu>
     
    </div>
  );
};