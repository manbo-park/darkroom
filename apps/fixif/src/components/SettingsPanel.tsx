import { useState } from 'react';
import { X } from 'lucide-react';
import { Input, Switch } from '@darkroom/ui';
import { useSettingsStore } from '../store/useSettingsStore';

export function SettingsPanel() {
    const settingsOpen = useSettingsStore((s) => s.settingsOpen);
    const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
    const exportSuffix = useSettingsStore((s) => s.exportSuffix);
    const setExportSuffix = useSettingsStore((s) => s.setExportSuffix);
    const includeGps = useSettingsStore((s) => s.includeGps);
    const setIncludeGps = useSettingsStore((s) => s.setIncludeGps);
    const includeMemo = useSettingsStore((s) => s.includeMemo);
    const setIncludeMemo = useSettingsStore((s) => s.setIncludeMemo);

    const [prevSettingsOpen, setPrevSettingsOpen] = useState(settingsOpen);
    const [closing, setClosing] = useState(false);
    const [suffixInput, setSuffixInput] = useState(exportSuffix);
    const [suffixError, setSuffixError] = useState('');

    // settingsOpen이 바뀌는 렌더 중 즉시 closing 상태와 입력값을 동기화한다 (effect 지연 없이).
    if (settingsOpen !== prevSettingsOpen) {
        setPrevSettingsOpen(settingsOpen);
        setClosing(!settingsOpen);
        if (settingsOpen) {
            setSuffixInput(exportSuffix);
            setSuffixError('');
        }
    }

    if (!settingsOpen && !closing) return null;

    const handleSuffixChange = (v: string) => {
        setSuffixInput(v);
        if (/[/\\]/.test(v)) {
            setSuffixError('슬래시 문자는 사용할 수 없습니다');
        } else {
            setSuffixError('');
            setExportSuffix(v);
        }
    };

    const previewName = `photo01${suffixError ? suffixInput : exportSuffix}.jpg`;

    return (
        <>
            <div
                className="fixed inset-0 z-30 bg-black/40"
                onClick={() => setSettingsOpen(false)}
            />
            <aside
                className={`fixed right-4 top-4 bottom-4 w-72 bg-film-surface rounded-xl border border-film-border shadow-2xl flex flex-col z-40 overflow-hidden ${closing ? 'animate-slide-out' : 'animate-slide-in'}`}
                onAnimationEnd={() => {
                    if (closing) setClosing(false);
                }}
            >
                <div className="px-4 py-3 border-b border-film-border flex items-center justify-between shrink-0">
                    <h2 className="text-film-text font-semibold text-sm uppercase tracking-wider">
                        설정
                    </h2>
                    <button
                        onClick={() => setSettingsOpen(false)}
                        aria-label="닫기"
                        className="text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <p className="text-xs text-film-muted uppercase tracking-widest mb-3">
                            내보내기
                        </p>
                        <div className="space-y-3">
                            <Input
                                label="파일명 접미사"
                                type="text"
                                value={suffixInput}
                                onChange={(e) => handleSuffixChange(e.target.value)}
                                placeholder="_fixif"
                                error={suffixError}
                            />
                            {!suffixError && (
                                <p className="text-xs text-film-muted">
                                    예: <span className="text-film-text">{previewName}</span>
                                </p>
                            )}
                            <Switch
                                checked={includeGps}
                                onChange={setIncludeGps}
                                label="위치 정보"
                                description="위치 정보를 내보내기에 포함"
                            />
                            <Switch
                                checked={includeMemo}
                                onChange={setIncludeMemo}
                                label="메모"
                                description="메모를 내보내기에 포함"
                            />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
