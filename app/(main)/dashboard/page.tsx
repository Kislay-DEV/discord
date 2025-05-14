"use client"
import { useForm } from "react-hook-form"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import File from "@/components/file-upload";
import { Avatar } from "@radix-ui/react-avatar"

type Inputs = {
  Avatar:"";
}

export default function App() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Inputs>({
    defaultValues: {
      Avatar:""
    }
  });

  const onSubmit = async (data: Inputs) => {
    try{
    const response = await axios.post("/api/admin/dashboard/Avatar", data)
    console.log(response)
    const serverId = response.data.id
    if (response.status === 201) {
      alert("Server created successfully")
      form.reset()
      router.refresh()
    } 
  }catch (error) {
    console.error("Error creating server:", error)
    alert("An error occurred while creating the server")
  }
  }

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button variant="outline" onClick={toggleModal} >Upload Image</Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative text-gray-100">
            {/* Close button */}
            <Button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-800 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>

            {/* Header */}
            <div className="">
              <h2 className="text-xl font-bold text-gray-100 relative left-[88px]">Create an Avatar</h2>
              
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="Avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center">
                      <FormControl>
                        <File
                          endpoint="Avatar"
                          value={field.value}
                          onchange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                

                <div className="pt-4 flex justify-end ">
                  <Button
                    type="submit"
                    className="bg-indigo-600  hover:bg-indigo-700 text-white w-[396px] "
                  >
                    Update Avatar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
      <Avatar
      className="flex h-18 w-18 border-4 border-blue-500 rounded-full"
      />
    </>
  );
}
