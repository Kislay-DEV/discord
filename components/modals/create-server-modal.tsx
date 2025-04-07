
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

type Inputs = {
  name: string;
  imageUrl: string;
}

export default function CreateServer() {
    const {isOpen, onClose, type} = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "createServer"

  const form = useForm<Inputs>({
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  const onSubmit = async (data: Inputs) => {
    try{
    const response = await axios.post("/api/admin/server/create", data)
    const serverId = response.data.id
    if (response.status === 201) {
      alert("Server created successfully")
      router.push(`/server/${serverId}`)
      form.reset()
      router.refresh()
    } else {
      alert("Failed to create server")
    }
  }catch (error) {
    console.error("Error creating server:", error)
    alert("An error occurred while creating the server")
  }
  }

  const onclose = () => {
    form.reset()
    onClose()
  }

  return (
    <>
      

      <Dialog open={isModalOpen} onOpenChange={onclose}>
        <DialogContent className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-100 text-center">Customize your server</DialogTitle>
            <DialogDescription className="text-sm text-center mt-2 text-gray-400">
              Give your server a personality with a name and an image. You can always change it later.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-[396px]"
                >
                  Create Server
                </Button>
              </div>
            </form>
          </Form>

          <DialogClose asChild>
            <Button
              className="absolute top-4 right-4 text-gray-800 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}