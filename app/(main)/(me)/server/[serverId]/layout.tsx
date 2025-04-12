import Profile from "@/lib/profile";
import React from "react";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/server-sidebar";

const ServerIdLayout = async({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { serverId: string };
}) => {
    const profile = await Profile();
    if (!profile) {
        return (
            <div>
                <h1>Unauthorized</h1>
            </div>
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Use your base URL
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;

    try {
        const server = await axios.get(`${baseUrl}/api/admin/server/userId`, {
            headers: {
                Cookie: `user=${userCookie}`, // Forward the user cookie
            },
        });

        if (!server) return redirect("/");
    } catch (error) {
        console.error("Error fetching server:", error);
        return redirect("/");
    }

    return (
        <div className="h-full">
            <div className="md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={params.serverId} baseUrl={baseUrl} />
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
};

export default ServerIdLayout;
