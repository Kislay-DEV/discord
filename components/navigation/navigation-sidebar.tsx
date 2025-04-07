"use client"
import axios from "axios"

import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "../ui/separator"
import { useEffect, useState } from "react"

import NavigationAction from "./navigation-action"
import NavigationItem from "./navigation-item"
import { redirect } from "next/navigation"
import { ModeToggle } from "../mode-toggle"

interface Server {
  _id: string;
  name: string;
  imageUrl: string;
}

export const NavigationSidebar = () => {
  const [servers, setServers] = useState<Server[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/admin/server/userId')
        setServers(response.data.servers || [])
      } catch (err) {
        console.error(err)
        return redirect("/")
      } finally {
      }
    }
    fetchData()
  }, []) // Empty dependency array to run only once

  return (
    <div className="space-y-4 flex flex-col items-center h-full w-[72px] text-primary fixed inset-y-0 dark:bg-[#1E1F22] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.length > 0 && (
          servers.map((server) => (
            <div key={server._id} className="flex flex-col items-center justify-center ">
             <NavigationItem
                id={server._id}
                name={server.name}
                imageUrl={server.imageUrl}
             />
            </div>
          ))
        )}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4 ">
        <ModeToggle />
        <div className="relative group">
          <button className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
            {/* Replace 'U' with the first letter of the username dynamically */}
            U
          </button>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-white dark:bg-[#1E1F22] text-black dark:text-white rounded-md shadow-lg">
            <button className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}