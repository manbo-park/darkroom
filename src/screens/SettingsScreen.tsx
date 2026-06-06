import { PageLayout } from '@/components/ui/PageLayout';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';
import type { ApertureStop } from '@/types';

export function SettingsScreen() {
    const {
        autoNavigateToShooting,
        setAutoNavigateToShooting,
        autoFinishRoll,
        setAutoFinishRoll,
        recordLocation,
        setRecordLocation,
        carryOverExposure,
        setCarryOverExposure,
        apertureStop,
        setApertureStop,
        sortFramesNewestFirst,
        setSortFramesNewestFirst,
    } = useSettingsStore();

    const apertureStops: ApertureStop[] = ['1', '1/2', '1/3'];

    function handleRecordLocationChange(value: boolean) {
        if (!value) {
            setRecordLocation(false);
            return;
        }
        setRecordLocation(true);
        navigator.geolocation.getCurrentPosition(
            () => {},
            () => setRecordLocation(false),
        );
    }

    return (
        <PageLayout title="설정" showBack>
            <div className="px-4 py-4 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs text-film-muted uppercase tracking-widest px-1">
                        시작
                    </p>
                    <div className="bg-film-surface border border-film-border rounded-xl px-4 py-3">
                        <Switch
                            checked={autoNavigateToShooting}
                            onChange={setAutoNavigateToShooting}
                            label="촬영 중인 롤이 있으면 촬영 화면으로 시작"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs text-film-muted uppercase tracking-widest px-1">
                        롤
                    </p>
                    <div className="bg-film-surface border border-film-border rounded-xl px-4 py-3">
                        <Switch
                            checked={sortFramesNewestFirst}
                            onChange={setSortFramesNewestFirst}
                            label="프레임을 최신 순으로 정렬"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs text-film-muted uppercase tracking-widest px-1">
                        촬영
                    </p>
                    <div className="bg-film-surface border border-film-border rounded-xl px-4 divide-y divide-film-border">
                        <div className="py-3">
                            <Switch
                                checked={autoFinishRoll}
                                onChange={setAutoFinishRoll}
                                label="최대 프레임 수 도달 시 롤 자동 마무리"
                            />
                        </div>
                        <div className="py-3">
                            <Switch
                                checked={recordLocation}
                                onChange={handleRecordLocationChange}
                                label="위치 정보 기록"
                            />
                        </div>
                        <div className="py-3">
                            <Switch
                                checked={carryOverExposure}
                                onChange={setCarryOverExposure}
                                label="빠른 상세 기록 시 이전 프레임 f·SS값 불러오기"
                            />
                        </div>
                        <div className="py-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-film-text">
                                    조리개 기본 스탑 단위
                                </span>
                                <div className="grid grid-cols-3 border border-film-border rounded-lg overflow-hidden shrink-0">
                                    {apertureStops.map((stop) => (
                                        <button
                                            key={stop}
                                            onClick={() => setApertureStop(stop)}
                                            className={[
                                                'px-3 py-1.5 font-mono text-xs text-center transition-colors',
                                                apertureStop === stop
                                                    ? 'accent-gradient-bg text-film-bg'
                                                    : 'text-film-muted hover:text-film-text',
                                            ].join(' ')}
                                        >
                                            {stop}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="font-mono text-xs text-film-muted">
                                렌즈에 스탑 단위가 등록되지 않은 경우에만 적용됩니다
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
