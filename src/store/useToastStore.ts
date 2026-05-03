import { create } from 'zustand';

interface ToastStore {
    message: string | null;
    show: (message: string) => void;
    hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
    message: null,

    show: (message) => {
        if (timer) clearTimeout(timer);
        set({ message });
        timer = setTimeout(() => set({ message: null }), 2500);
    },

    hide: () => {
        if (timer) clearTimeout(timer);
        set({ message: null });
    },
}));
