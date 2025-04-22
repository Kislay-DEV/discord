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
import { Check, Copy, RefreshCw } from "lucide-react";
import { set } from "mongoose";

type Inputs = {
  name: string;
  imageUrl: string;
}

export default function InviteModal() {
  const { isOpen, onClose, type, data } = useModal();

  const [copied, setCopied] = useState(false)

  const server = data
  const origin = useOrigin()

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  const [inviteCode, setInviteCode] = useState(server?.server?.invites?.[0]?.code || "");

  useEffect(() => {
    setInviteCode(server?.server?.invites?.[0]?.code || "");
  }, [server]);
  
  const inviteUrl = `${origin}/invite/${inviteCode}`;
  
  const onNew = async () => {
    try {
      const serverId = server?.server?._id;
      if (!serverId) return;
      const response = await axios.patch(`/api/admin/server/${serverId}/invite-code`);
      if (response.data?.inviteCode) {
        setInviteCode(response.data.inviteCode);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isModalOpen = isOpen && type === "invite";

  const form = useForm<Inputs>({

  });



  const onclose = () => {
    form.reset()
    onClose()
  }

  if (!isModalOpen) return null;

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
            <h2 className="text-xl font-bold text-gray-100">Invite Friends</h2>
            <div className="p-2 w-96 ">
              <Label className="uppercase text-xs font-bold  ">
                Server Invite link
              </Label>
              <div className="flex items-center mt-2 gap-x-2">
                <Input
                  className="bg-zinc-300/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0   "
                  value={inviteUrl}
                  readOnly
                />
                <Button size="icon" onClick={onCopy}>
                  {copied ? <Check className="h-4 w-4"/>:<Copy className="w-4 h-4" /> }
                  
                </Button>
              </div>  
              <Button variant="link"
              onClick={onNew}
                size="sm"
                className="text-xs text-zinc-400 mt-4">
                Generate a new link
                <RefreshCw className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>


        </div>
      </div>
    </>
  )
}