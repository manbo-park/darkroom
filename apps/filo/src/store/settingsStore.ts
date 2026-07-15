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
    sortFramesNewestFirst: boolean;
    setSortFramesNewestFirst: (value: boolean) => void;
    hasSeenTutorial: boolean;
    setHasSeenTutorial: (value: boolean) => void;
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
            sortFramesNewestFirst: false,
            setSortFramesNewestFirst: (value) => set({ sortFramesNewestFirst: value }),
            hasSeenTutorial: false,
            setHasSeenTutorial: (value) => set({ hasSeenTutorial: value }),
        }),
        {
            name: 'filo-settings',
            storage: createJSONStorage(() => localStorage),
            version: 2,
            // 조리개 스탑 단위는 렌즈 데이터로 이전됨. 더 이상 쓰지 않는 키를 정리한다.
            migrate: (persisted) => {
                const state = (persisted ?? {}) as Record<string, unknown>;
                delete state.halfStopAperture;
                delete state.apertureStop;
                return state as unknown as SettingsState;
            },
        },
    ),
);
