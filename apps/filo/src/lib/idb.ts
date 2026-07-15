import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand persist storage adapter backed by IndexedDB (via idb-keyval).
 * Prevents OS-level data purging that can affect localStorage on mobile Safari.
 */
export const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get<string>(name)) ?? null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};
