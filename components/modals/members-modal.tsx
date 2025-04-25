"use client"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react";
import axios from "axios"

import { useModal } from "@/hooks/use-model-store"
import { ScrollArea } from "@radix-ui/react-scroll-area";

import { UserAvatar } from "../UserAvatar";

type Inputs = {
  name: string;
  imageUrl: string;
}

type Member = {
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  roles: string[];
  joinedAt: string;
  _id: string;
};

export default function MembersModal() {
  const [members, setMembers] = useState<Member[]>([]);
  const { isOpen, onClose, type, data } = useModal();
  const { server } = data;

  const isModalOpen = isOpen && type === "members";

  const form = useForm<Inputs>();

  useEffect(() => {
    const fetchMembers = async () => {
      if (!server?._id) return;

      try {
        const response = await axios.get(`/api/admin/server/${server._id}/members`);
        setMembers(response.data.members || []);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      }
    };

    if (isModalOpen) {
      fetchMembers();
    }
  }, [server, isModalOpen]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      <div className="fixed top-28 left-[580px] transform -translate-x-1/2 z-50">
        <div className="border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100 max-h-[90vh] overflow-y-auto relative">
          <button
            title="addserver"
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
            
              {members.map((member) => (
                <div key={member._id} className="flex items-center gap-x-2 mb-6">
                  <UserAvatar src={member.user.avatar} name={member.user.username} className="object-cover rounded-full h-10 w-10" />

                  <div className="flex flex-col gap-y-1 " >
                    <div className="text-sm font-semibold">{member.user.username}</div>
                    <div className="text-xs text-gray-400">{member.user._id}</div>
                  </div>
                </div>
              ))}
            
          </ScrollArea>
        </div>
      </div>
    </>
  )
}