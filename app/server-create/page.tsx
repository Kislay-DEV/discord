"use client"
import { useForm } from "react-hook-form"
import axios from "axios"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import  File  from "@/components/file-upload";

type Inputs = {
  name: string;
  imageUrl: string;
}

export default function App() {
  const form = useForm<Inputs>({
    defaultValues: {
      name: "",
    }
  });

  const onSubmit = async (data: Inputs) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.imageUrl) {
        formData.append("imageUrl", data.imageUrl);
      }
      
      const response = await axios.post("/api/servers", formData);
    } catch (error) {
      console.log("ERROR", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create a Server</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription>
            Dive into the world of Discord Servers
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  
                  <FormControl>
                    <File
                      endpoint="serverImage"
                      value={field.value}
                      onchange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter server name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            

            <DialogFooter>
              <Button type="submit">Create Server</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}