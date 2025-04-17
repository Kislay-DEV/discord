
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams for accessing route params
import axios from "axios";

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

  useEffect(() => {
    if (!serverId) return; // Ensure serverId is available before making the API call

    const fetchRoles = async () => {
      try {
        const response = await axios.get(`/api/admin/server/${serverId}/role`);
        if (response.data && response.data.serverRole) {
          console.log(response.data.serverRole);
          setRoles(response.data.serverRole); // Set all roles in state
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

  if (!serverId) {
    return <p>Server ID is missing. Unable to fetch roles.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{serverName || "Server"}</h1>
        <p className="text-sm text-muted-foreground ml-2">
          {adminRole ? adminRole.name : "Member"}
        </p>
      </div>
      <div>
        <p className="text-sm">
          Role: {adminRole ? "Admin" : everyoneRole ? "@everyone" : "Member"}
        </p>
      </div>
    </div>
  );
};