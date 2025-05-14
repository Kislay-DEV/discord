"use client"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react";
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrigin } from "@/hooks/use-origin";

import { useModal } from "@/hooks/use-model-store"
import { Label } from "@/components/ui/label";
import { Check, Copy, Ghost, RefreshCw } from "lucide-react";
import { set } from "mongoose";

type Inputs = {
  name: string;
  imageUrl: string;
}

export default function LeaveServer() {
  const router = useRouter()
  const { isOpen, onClose, type, data } = useModal();
  const [isloading, setisloading] = useState(false)

  const [copied, setCopied] = useState(false)

  const server = data
  const origin = useOrigin()

 


  


  const isModalOpen = isOpen && type === "leaveServer";

  const form = useForm<Inputs>({

  });



  const onclose = () => {
    form.reset()
    onClose()
  }

  if (!isModalOpen) return null;

  const onClickhandle = async () => {
    setisloading(true)
    try {
      const res = await axios.patch(`/api/admin/server/${server?.server?._id}/leave`, {
        serverId: server?.server?._id
      })
      if (res.status === 200) {
        onClose()
      }
      router.refresh()
    } catch (error) {
      console.log(error)
    } finally {
      setisloading(false)
  }
  }

  return (
    <>
      {/* Overlay to darken the background */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onclose} />

      {/* Modal content */}
      <div className="fixed top-28 left-[580px]  transform -translate-x-1/2 z-50 ">
        <div className=" border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100 max-h-[90vh] overflow-y-auto relative">

          <button title="addserver"
            onClick={onclose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-100">Leave Server</h2>
            <p className="text-sm mt-2 text-gray-400">
            Are you sure you want to leave <span className="text-indigo-400">{server?.server?.name}</span>? You can always rejoin later.
          </p>
            <div className="bg-gray-900/30 border border-gray-800 rounded-md p-3 mt-4 text-gray-200 text-sm">
              <Label className="uppercase text-xs font-bold  ">
                Leave Server
              </Label>
              <div className="flex items-center mt-2 gap-x-2">
               <Button
               disabled={isloading}
               onClick={onclose}
               variant="ghost"
               >
                Cancel
               </Button>
               <Button
               disabled={isloading}
               onClick={onClickhandle}
               variant="default"
               >
                Confirm
               </Button>
              
              </div>  
              
            </div>
          </div>


        </div>
      </div>
    </>
  )
}