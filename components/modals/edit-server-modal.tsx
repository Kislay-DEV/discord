import { useForm } from "react-hook-form"
import axios from "axios"
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
import { useModal } from "@/hooks/use-model-store"
import { useEffect } from "react";

type Inputs = {
  name: string;
  imageUrl: string;
}

export default function EditServer() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "editServer";
  const {server} = data

  const form = useForm<Inputs>({
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  useEffect(()=>{
    if(server){
      form.setValue("name", server.name)
      form.setValue("imageUrl", server.imageUrl)
    }
  },[server, form])

  const onSubmit = async (data: Inputs) => {
    try {
      const response = await axios.patch(`/api/admin/server/${server?._id}/edit`, data)
      const serverId = response.data.id
      if (response.status === 201) {
        alert("Server created successfully")
        router.push(`/server/${serverId}`)
        form.reset()
        router.refresh()
      } else {
        alert("Failed to create server")
      }
    } catch (error) {
      console.error("Error creating server:", error)
      alert("An error occurred while creating the server")
    }
  }

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
    <div className="fixed top-28 left-[580px]  transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100 max-h-[90vh] overflow-y-auto relative">
        
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
          <h2 className="text-xl font-bold text-gray-100">Customize your server</h2>
          <p className="text-sm mt-2 text-gray-400">
            Give your server a personality with a name and an image. You can always change it later.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center">
                  <FormControl>
                    <File
                      endpoint="serverImage"
                      value={field.value}
                      onchange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">SERVER NAME</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter server name"
                      className="bg-gray-800 border-gray-700 text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
              >
                Create Server
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  </>
)}
