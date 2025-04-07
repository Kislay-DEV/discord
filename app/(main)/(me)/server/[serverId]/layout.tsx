import {NavigationSidebar} from "@/components/navigation/navigation-sidebar";
import { ModalProvider } from "@/components/providers/modal-provider";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
                
        <div className="h-full">
            <div className=" hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0 ">
                <NavigationSidebar/>
                <main className="md:pl-[72px] h-full">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default MainLayout