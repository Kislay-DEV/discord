import {create} from 'zustand';

export type ModalType = "createServer";

interface ModalStore {
  isOpen: boolean;
    type: ModalType | null;
    onOpen: (type: ModalType) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
    type:null,
    isOpen: false,
    onOpen: (type) => set({ isOpen: true, type }),
    onClose: () => set({ isOpen: false, type: null }),
}));