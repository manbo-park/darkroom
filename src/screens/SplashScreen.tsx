import { useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import { useSettingsStore } from '@/store/settingsStore';

interface PersistApi {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
}

// 스토어의 persist hydration 완료 여부를 외부 스토어로 구독한다.
// useSyncExternalStore가 구독 등록 시점에 스냅샷을 재확인하므로,
// 렌더와 구독 사이에 hydration이 끝나는 race를 별도 처리 없이 안전하게 다룬다.
function useHydrated(persist: PersistApi) {
    return useSyncExternalStore(
        (onStoreChange) => persist.onFinishHydration(onStoreChange),
        () => persist.hasHydrated(),
    );
}

export function SplashScreen() {
    const navigate = useNavigate();

    const rollsHydrated = useHydrated(useRollStore.persist);
    const masterHydrated = useHydrated(useMasterDataStore.persist);
    const settingsHydrated = useHydrated(useSettingsStore.persist);

    const activeRollId = useRollStore((s) => s.activeRollId);
    const rolls = useRollStore((s) => s.rolls);
    const autoNavigateToShooting = useSettingsStore((s) => s.autoNavigateToShooting);

    useEffect(() => {
        if (!rollsHydrated || !masterHydrated || !settingsHydrated) return;

        const activeRoll = rolls.find((r) => r.id === activeRollId && r.status === 'active');

        const timer = setTimeout(() => {
            navigate(activeRoll && autoNavigateToShooting ? '/shoot' : '/rolls', { replace: true });
        }, 1200);

        return () => clearTimeout(timer);
    }, [rollsHydrated, masterHydrated, settingsHydrated, activeRollId, rolls, autoNavigateToShooting, navigate]);

    // black 상태바에서 웹 뷰포트는 상단 상태바(시스템 영역) 아래에서 시작하므로,
    // 그냥 중앙 정렬하면 로고가 물리 화면 중심보다 상태바 높이의 절반만큼 아래로
    // 치우친다. 상단 시스템 영역 높이(screen.height - innerHeight)만큼 하단 패딩을
    // 주어 물리 화면 기준 중앙에 오도록 보정한다.
    const topChrome =
        typeof window !== 'undefined' ? Math.max(0, window.screen.height - window.innerHeight) : 0;

    return (
        <div
            className="fixed inset-0 bg-film-bg flex flex-col items-center justify-center gap-6 animate-fade-in"
            style={{ paddingBottom: topChrome }}
        >
            {/* Logo */}
            <img src="/filo-logo-white-with-shadow.png" alt="filo" className="h-40" />

            {/* Loading indicator */}
            {!rollsHydrated || !masterHydrated || !settingsHydrated ? (
                <div className="flex gap-1.5 mt-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-film-muted animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
