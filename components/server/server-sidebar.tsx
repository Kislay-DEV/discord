"use client"
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
  serverId: string;
  baseUrl: string;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ serverId, baseUrl }) => {
  const [serverData, setServerData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        console.log("Fetching server data:", { baseUrl, serverId }); // Debugging log
        const response = await axios.get(`${baseUrl}/api/admin/server/${serverId}`);
        console.log("Server data fetched successfully:", response.data); // Debugging log
        setServerData(response.data);
      } catch (error: any) {
        console.error("Error fetching server data:", error.response?.data || error.message); // Log detailed error
        setError("Error loading server data");
      }
    };

    fetchServerData();
  }, [serverId, baseUrl]);

 
  

  if (error) {
    return (
      <div>
        <h2>Server Sidebar</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!serverData) {
    return (
      <div>
        <h2>Server Sidebar</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const textChannels = serverData.channels.filter((channel: any) => channel.type === "TEXT");
  const audioChannels = serverData.channels.filter((channel: any) => channel.type === "AUDIO");
  const videoChannels = serverData.channels.filter((channel: any) => channel.type === "VIDEO");

  const members = serverData.server.members.filter(
    (member: any) => serverData.profile && member.profileId !== serverData.profile.id
  );
  const role = serverData.roles

  
  return (
    <div>
      <h2>Server Sidebar</h2>
      <p>Server ID: {serverId}</p>
      <p>Server Name: {serverData.server.name}</p>
      <p>Text Channels: {textChannels.length}</p>
      <p>Audio Channels: {audioChannels.length}</p>
      <p>Video Channels: {videoChannels.length}</p>
      <p>Members: {members.length}</p>
      <p>Role:{role}</p>
      <ServerHeader server={serverData.server}
      role={role}/>
    </div>
  );
};