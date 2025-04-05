import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "../ui/separator"
import NavigationAction from "./navigation-action"

export const NavigationSidebar = async() => {
  return (
    <div className="space-y-4 flex flex-col items-center h-full w-[72px] text-primary fixed inset-y-0  dark:bg-[#1E1F22]  py-3">
       <NavigationAction/>
       <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
       <ScrollArea className="flex-1 w-full">
        
        </ScrollArea>
    </div>
  )
}
 