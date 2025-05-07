import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-model-store";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Schema to match backend requirements
const channelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(100, "Channel name is too long"),
  type: z.enum(["TEXT", "AUDIO", "VIDEO", "FORUM", "THREAD"], {
    required_error: "Please select a channel type",
  }),
  topic: z.string().max(1024, "Topic cannot exceed 1024 characters").optional(),
  isNSFW: z.boolean().default(false),
});

type ChannelFormValues = z.infer<typeof channelSchema>;

export default function CreateChannel() {
  const { isOpen, onClose, type, data } = useModal();
  const { server } = data;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isModalOpen = isOpen && type === "createChannel";

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
      type: "TEXT",
      topic: "",
      isNSFW: false,
    },
  });

  const onSubmit = async (values: ChannelFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const serverId = server?._id;
      
      if (!serverId) {
        throw new Error("Server ID is required");
      }
      
      const response = await axios.post("/api/admin/channel/create", {
        ...values,
        serverId
      });
      
      if (response.status === 201) {
        form.reset();
        router.refresh();
        onClose();
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to create channel");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <>
      {/* Overlay to darken the background */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Modal content */}
      <div className="fixed  left-1/2 transform -translate-x-1/2 translate-y-1/2 z-50">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 text-gray-100 max-h-[90vh] overflow-y-auto relative">
          <button
            title="Close dialog"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-100">Create Channel</h2>
            <p className="text-gray-400 text-sm">Add a new channel to {server?.name}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">CHANNEL NAME</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter channel name"
                        className="bg-gray-800 border-gray-700 text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">CHANNEL TYPE</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 text-gray-100">
                        <SelectGroup>
                          <SelectItem value="TEXT">TEXT</SelectItem>
                          <SelectItem value="AUDIO">AUDIO</SelectItem>
                          <SelectItem value="VIDEO">VIDEO</SelectItem>
                          <SelectItem value="FORUM">FORUM</SelectItem>
                          <SelectItem value="THREAD">THREAD</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">TOPIC (OPTIONAL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a channel topic"
                        className="bg-gray-800 border-gray-700 text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isNSFW"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-600"
                        disabled={isLoading}
                        title="Age-Restricted Channel"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-300">Age-Restricted Channel</FormLabel>
                      <p className="text-xs text-gray-400">
                        This channel will only be visible to users who are 18+
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Channel"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}