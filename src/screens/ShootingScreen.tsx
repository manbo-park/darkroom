import { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, List, Film, Camera, RefreshCw } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { QuickRecordModal } from '@/components/roll/QuickRecordModal';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Frame } from '@/types';

export function ShootingScreen() {
    const navigate = useNavigate();
    const activeRoll = useRollStore((s) =>
        s.rolls.find((r) => r.id === s.activeRollId && r.status === 'active'),
    );
    const { recordFrame, updateFrame, deleteFrame, finishRoll, setCurrentLens } = useRollStore(
        useShallow((s) => ({
            recordFrame: s.recordFrame,
            updateFrame: s.updateFrame,
            deleteFrame: s.deleteFrame,
            finishRoll: s.finishRoll,
            setCurrentLens: s.setCurrentLens,
        })),
    );
    const { films, cameras, lenses } = useMasterDataStore(
        useShallow((s) => ({ films: s.films, cameras: s.cameras, lenses: s.lenses })),
    );
    const { autoFinishRoll, recordLocation } = useSettingsStore(
        useShallow((s) => ({ autoFinishRoll: s.autoFinishRoll, recordLocation: s.recordLocation })),
    );
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [showUndoConfirm, setShowUndoConfirm] = useState(false);
    const [showLensSwap, setShowLensSwap] = useState(false);
    const [showOverageModal, setShowOverageModal] = useState(false);
    const [hasShownOverageModal, setHasShownOverageModal] = useState(false);
    const [justRecorded, setJustRecorded] = useState(false);
    const [showQuickRecord, setShowQuickRecord] = useState(false);
    const [quickRecordKey, setQuickRecordKey] = useState(0);
    const [dragDeltaY, setDragDeltaY] = useState(0);
    const cachedPositionRef = useRef<GeolocationPosition | null>(null);
    const dragStartYRef = useRef<number | null>(null);
    const isDragRef = useRef(false);

    useEffect(() => {
        if (!recordLocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => { cachedPositionRef.current = pos; },
            () => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [recordLocation]);

    if (!activeRoll) {
        return (
            <PageLayout title="촬영">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-film-muted font-mono text-sm">촬영 중인 롤이 없습니다.</p>
                    <Button variant="primary" onClick={() => navigate('/rolls', { replace: true })}>
                        롤 목록으로
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const film = films.find((f) => f.id === activeRoll.filmId);
    const camera = cameras.find((c) => c.id === activeRoll.cameraId);
    const currentLens = lenses.find((l) => l.id === activeRoll.currentLensId);

    const frameCount = activeRoll.frames.length;
    const maxFrames = activeRoll.maxFrames;
    const isOverMax = frameCount >= maxFrames;
    const nextFrame = frameCount + 1;
    const progressPct = Math.min((frameCount / maxFrames) * 100, 100);

    function doRecord(patch?: Partial<Pick<Frame, 'aperture' | 'shutterSpeed' | 'memo'>>) {
        const frameId = recordFrame(activeRoll!.id);
        // 렌더 시점의 stale frameCount 대신 스토어의 최신 길이를 사용한다.
        // (연속 탭 시 자동 마무리·초과 모달 분기가 잘못 판단되는 것을 방지)
        const updatedRoll = useRollStore.getState().rolls.find((r) => r.id === activeRoll!.id);
        const newCount = updatedRoll?.frames.length ?? frameCount + 1;

        if (frameId) {
            const locationPatch =
                recordLocation && cachedPositionRef.current
                    ? {
                          latitude: cachedPositionRef.current.coords.latitude,
                          longitude: cachedPositionRef.current.coords.longitude,
                          locationAccuracy: cachedPositionRef.current.coords.accuracy,
                      }
                    : {};
            if (patch || recordLocation) {
                updateFrame(activeRoll!.id, frameId, { ...locationPatch, ...patch });
            }
        }
        if (newCount >= maxFrames && autoFinishRoll) {
            finishRoll(activeRoll!.id);
            navigate('/rolls', { replace: true });
            return;
        }
        setJustRecorded(true);
        setTimeout(() => setJustRecorded(false), 600);
        if (newCount === maxFrames && !hasShownOverageModal) {
            setShowOverageModal(true);
            setHasShownOverageModal(true);
        }
    }

    function handleRecord() {
        doRecord();
    }

    function handlePointerDown(e: React.PointerEvent) {
        dragStartYRef.current = e.clientY;
        isDragRef.current = false;
        setDragDeltaY(0);
    }

    function handlePointerMove(e: React.PointerEvent) {
        if (dragStartYRef.current === null) return;
        const delta = Math.max(0, dragStartYRef.current - e.clientY);
        setDragDeltaY(delta);
    }

    function handlePointerUp(e: React.PointerEvent) {
        if (dragStartYRef.current === null) return;
        const deltaY = dragStartYRef.current - e.clientY;
        dragStartYRef.current = null;
        setDragDeltaY(0);
        if (deltaY >= 60) {
            isDragRef.current = true;
            setQuickRecordKey((k) => k + 1);
            setShowQuickRecord(true);
        }
    }

    function handlePointerCancel() {
        dragStartYRef.current = null;
        isDragRef.current = false;
        setDragDeltaY(0);
    }

    function handleClick() {
        if (isDragRef.current) {
            isDragRef.current = false;
            return;
        }
        handleRecord();
    }

    function handleUndo() {
        if (frameCount === 0) return;
        const lastFrame = activeRoll!.frames[activeRoll!.frames.length - 1];
        deleteFrame(activeRoll!.id, lastFrame.id);
    }

    function handleFinish() {
        finishRoll(activeRoll!.id);
        setShowFinishConfirm(false);
        navigate('/rolls', { replace: true });
    }

    return (
        <PageLayout
            title="촬영"
            showBack
            noScroll
            onBack={() => navigate('/rolls')}
            rightAction={
                <button
                    onClick={() => navigate(`/rolls/${activeRoll.id}`)}
                    className="p-2 text-film-muted hover:text-film-text transition-colors"
                    title="컷 목록 보기"
                >
                    <List size={18} />
                </button>
            }
        >
            <div className="flex flex-col h-content px-4 pt-4">
                {/* Roll info card */}
                <div className="bg-film-surface border border-film-border rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-film-accent animate-pulse" />
                        <span className="text-film-accent font-mono text-xs uppercase tracking-widest">
                            현재 롤
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <Film size={14} className="text-film-accent" />
                        <span className="text-film-text font-mono font-semibold text-sm">
                            {film?.name ?? '—'}
                        </span>
                        {film?.iso && (
                            <span className="text-film-muted font-mono text-xs">
                                ISO {film.iso}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Camera size={14} className="text-film-muted" />
                            <span className="text-film-muted font-mono text-xs">
                                {camera?.name ?? '—'}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowLensSwap(true)}
                            className="flex items-center gap-1.5 text-film-muted hover:text-film-text transition-colors"
                        >
                            <RefreshCw size={11} />
                            <span className="font-mono text-xs">
                                {currentLens ? currentLens.name : '렌즈 없음'}
                            </span>
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono mb-1.5">
                            <span className="text-film-muted">{frameCount}컷 촬영</span>
                            <span className={isOverMax ? 'text-film-accent' : 'text-film-muted'}>
                                {isOverMax
                                    ? `+${frameCount - maxFrames}컷 초과`
                                    : `${maxFrames - frameCount}컷 남음`}
                            </span>
                        </div>
                        <div className="h-1 bg-film-border rounded-full overflow-hidden">
                            <div
                                className="h-full accent-gradient-bg transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Frame counter — big display */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <span className="text-film-muted font-mono text-xs uppercase tracking-widest">
                        다음 컷
                    </span>
                    <div
                        className={[
                            'text-[9rem] font-mono font-bold leading-none tabular-nums transition-all duration-150',
                            justRecorded ? 'text-film-accent scale-110' : 'text-film-text',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {String(nextFrame).padStart(2, '0')}
                    </div>
                    <span className="text-film-border font-mono text-sm">
                        / {String(maxFrames).padStart(2, '0')}
                    </span>
                </div>

                {/* RECORD button */}
                <div className="flex flex-col gap-3 pb-safe-bottom">
                    <div className="relative">
                        <span
                            className="absolute inset-x-0 -top-10 flex items-center justify-center font-mono text-xs text-film-muted tracking-widest transition-opacity duration-100"
                            style={{ opacity: dragDeltaY >= 60 ? 0 : 1 }}
                        >
                            ↑ 위로 드래그해서 빠른 상세 기록
                        </span>
                        <button
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerCancel}
                            onClick={handleClick}
                            style={{
                                touchAction: 'none',
                                transform: `translateY(-${Math.min(dragDeltaY * 0.2, 12)}px)`,
                            }}
                            className={[
                                'w-full py-6 rounded-2xl font-mono font-bold text-xl tracking-widest uppercase transition-transform duration-75',
                                justRecorded
                                    ? 'accent-gradient-bg text-film-bg'
                                    : dragDeltaY >= 60
                                      ? 'accent-gradient-bg text-film-bg'
                                      : 'accent-gradient-border text-film-text',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {justRecorded ? '✓ 기록됨' : dragDeltaY >= 60 ? '빠른 상세 기록' : '기록'}
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            size="md"
                            fullWidth
                            onClick={() => setShowFinishConfirm(true)}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle size={16} />롤 마무리
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="md"
                            fullWidth
                            disabled={frameCount === 0}
                            onClick={() => setShowUndoConfirm(true)}
                        >
                            <span className="flex items-center justify-center gap-1.5">
                                ↩ 되돌리기
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overage modal — shown once when maxFrames is reached */}
            <ConfirmModal
                isOpen={showOverageModal}
                onClose={() => setShowOverageModal(false)}
                title="롤을 마무리할까요?"
                message={
                    <>
                        <span className="text-film-text font-bold">{maxFrames}</span>컷을 모두
                        촬영했습니다. 계속 촬영하거나 롤을 마무리할 수 있습니다.
                    </>
                }
                cancelLabel="계속 촬영"
                confirmLabel="마무리"
                onConfirm={() => {
                    setShowOverageModal(false);
                    setShowFinishConfirm(true);
                }}
            />

            {/* Finish confirmation */}
            <ConfirmModal
                isOpen={showFinishConfirm}
                onClose={() => setShowFinishConfirm(false)}
                title="롤을 마무리할까요?"
                message={
                    <>
                        <span className="text-film-text font-bold">{frameCount}</span>
                        {' / '}
                        <span className="text-film-text font-bold">{maxFrames}</span>컷을
                        촬영했습니다.
                    </>
                }
                cancelLabel="취소"
                confirmLabel="마무리"
                onConfirm={handleFinish}
            />

            {/* Undo confirmation */}
            <ConfirmModal
                isOpen={showUndoConfirm}
                onClose={() => setShowUndoConfirm(false)}
                title="마지막 컷을 되돌릴까요?"
                message={
                    <>
                        <span className="text-film-text font-bold">{frameCount}</span>번째 컷 기록이
                        삭제됩니다.
                    </>
                }
                cancelLabel="취소"
                confirmLabel="되돌리기"
                onConfirm={() => {
                    handleUndo();
                    setShowUndoConfirm(false);
                }}
            />
            <QuickRecordModal
                key={quickRecordKey}
                rollId={activeRoll.id}
                isOpen={showQuickRecord}
                onClose={() => setShowQuickRecord(false)}
                onSave={(patch) => doRecord(patch)}
            />

            {/* Lens swap modal */}
            <Modal isOpen={showLensSwap} onClose={() => setShowLensSwap(false)} title="렌즈 교환">
                <div className="flex flex-col gap-1">
                    {lenses.length === 0 ? (
                        <p className="text-film-muted font-mono text-sm text-center py-4">
                            등록된 렌즈가 없습니다.
                        </p>
                    ) : (
                        <>
                            {lenses.map((lens) => {
                                const isSelected = lens.id === activeRoll.currentLensId;
                                return (
                                    <button
                                        key={lens.id}
                                        onClick={() => {
                                            setCurrentLens(activeRoll.id, lens.id);
                                            setShowLensSwap(false);
                                        }}
                                        className={[
                                            'w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-colors',
                                            isSelected
                                                ? 'bg-film-accent/15 text-film-accent'
                                                : 'text-film-text hover:bg-film-surface',
                                        ].join(' ')}
                                    >
                                        {lens.name}
                                        {isSelected && (
                                            <span className="ml-2 text-xs text-film-accent">✓</span>
                                        )}
                                    </button>
                                );
                            })}
                            <div className="border-t border-film-border mt-1 pt-1">
                                <button
                                    onClick={() => {
                                        setCurrentLens(activeRoll.id, undefined);
                                        setShowLensSwap(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg font-mono text-sm text-film-muted hover:bg-film-surface transition-colors"
                                >
                                    렌즈 없음
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </PageLayout>
    );
}
