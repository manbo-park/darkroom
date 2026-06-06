import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    autoNavigateToShooting: boolean;
    setAutoNavigateToShooting: (value: boolean) => void;
    autoFinishRoll: boolean;
    setAutoFinishRoll: (value: boolean) => void;
    recordLocation: boolean;
    setRecordLocation: (value: boolean) => void;
    carryOverExposure: boolean;
    setCarryOverExposure: (value: boolean) => void;
    halfStopAperture: boolean;
    setHalfStopAperture: (value: boolean) => void;
    sortFramesNewestFirst: boolean;
    setSortFramesNewestFirst: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoNavigateToShooting: true,
            setAutoNavigateToShooting: (value) => set({ autoNavigateToShooting: value }),
            autoFinishRoll: false,
            setAutoFinishRoll: (value) => set({ autoFinishRoll: value }),
            recordLocation: false,
            setRecordLocation: (value) => set({ recordLocation: value }),
            carryOverExposure: true,
            setCarryOverExposure: (value) => set({ carryOverExposure: value }),
            halfStopAperture: false,
            setHalfStopAperture: (value) => set({ halfStopAperture: value }),
            sortFramesNewestFirst: false,
            setSortFramesNewestFirst: (value) => set({ sortFramesNewestFirst: value }),
        }),
        {
            name: 'filo-settings',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
