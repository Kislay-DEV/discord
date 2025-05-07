import {Server} from '@/schema/Server.schema';
import {create} from 'zustand';

export type ModalType = "createServer" | "invite" | "editServer"| "members" | "createChannel";


interface ModalData {
  server?:Server
}
interface ModalStore {
  isOpen: boolean;
  data:ModalData;
    type: ModalType | null;
    onOpen: (type: ModalType, data?:ModalData) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
    type:null,
    data:{},
    isOpen: false,
    onOpen: (type,data={}) => set({ isOpen: true, type, data }),
    onClose: () => set({ isOpen: false, type: null }),
}));