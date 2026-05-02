import { create } from 'zustand';
import type { FrameItem } from '../types/frame';

interface FrameStore {
    frames: FrameItem[];
    selectedIds: Set<string>;
    addFrames: (frames: FrameItem[]) => void;
    removeFrames: (ids: string[]) => void;
    toggleSelect: (id: string, shiftHeld: boolean, lastClickedId: string | null) => void;
    selectAll: () => void;
    clearSelection: () => void;
    lastClickedId: string | null;
}

export const useFrameStore = create<FrameStore>((set, get) => ({
    frames: [],
    selectedIds: new Set(),
    lastClickedId: null,

    addFrames: (newFrames) =>
        set((state) => ({ frames: [...state.frames, ...newFrames] })),

    removeFrames: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
            frames: state.frames.filter((f) => !idSet.has(f.id)),
            selectedIds: new Set([...state.selectedIds].filter((id) => !idSet.has(id))),
        }));
    },

    toggleSelect: (id, shiftHeld, lastClickedId) => {
        const { frames, selectedIds } = get();
        if (shiftHeld && lastClickedId) {
            const idxA = frames.findIndex((f) => f.id === lastClickedId);
            const idxB = frames.findIndex((f) => f.id === id);
            if (idxA !== -1 && idxB !== -1) {
                const [start, end] = idxA < idxB ? [idxA, idxB] : [idxB, idxA];
                const next = new Set(selectedIds);
                for (let i = start; i <= end; i++) next.add(frames[i].id);
                set({ selectedIds: next, lastClickedId: id });
                return;
            }
        }
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        set({ selectedIds: next, lastClickedId: id });
    },

    selectAll: () =>
        set((state) => ({ selectedIds: new Set(state.frames.map((f) => f.id)) })),

    clearSelection: () => set({ selectedIds: new Set(), lastClickedId: null }),
}));
