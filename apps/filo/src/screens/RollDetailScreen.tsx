import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Play, Plus, Pencil, Camera, FileText, ClipboardCopy, Check, ArrowUpDown } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CopyToast } from '@/components/ui/CopyToast';
import { useClipboardToast } from '@/hooks/useClipboardToast';
import { FrameItem } from '@/components/roll/FrameItem';
import { EditFrameModal } from '@/components/roll/EditFrameModal';
import { EditRollModal } from '@/components/roll/EditRollModal';
import { AddFrameModal } from '@/components/roll/AddFrameModal';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import { useSettingsStore } from '@/store/settingsStore';
import { buildExifPayload } from '@/lib/exifPayload';
import type { Frame } from '@/types';

export function RollDetailScreen() {
    const { rollId } = useParams<{ rollId: string }>();
    const navigate = useNavigate();
    const roll = useRollStore((s) => s.rolls.find((r) => r.id === rollId));
    const { deleteRoll, resumeRoll, setActiveRollId } = useRollStore(
        useShallow((s) => ({
            deleteRoll: s.deleteRoll,
            resumeRoll: s.resumeRoll,
            setActiveRollId: s.setActiveRollId,
        })),
    );
    const { films, cameras, lenses } = useMasterDataStore(
        useShallow((s) => ({ films: s.films, cameras: s.cameras, lenses: s.lenses })),
    );
    const sortFramesNewestFirst = useSettingsStore((s) => s.sortFramesNewestFirst);

    const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
    const [reversedFrames, setReversedFrames] = useState(sortFramesNewestFirst);
    const { copied, copyError, fading: toastFading, triggerCopied, triggerCopyError } =
        useClipboardToast();
    const [showDeleteRoll, setShowDeleteRoll] = useState(false);
    const [showResumeConfirm, setShowResumeConfirm] = useState(false);
    const [showAddFrame, setShowAddFrame] = useState(false);
    const [showEditRoll, setShowEditRoll] = useState(false);

    if (!roll) {
        return (
            <PageLayout title="롤" showBack>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-film-muted font-mono text-sm">롤을 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate('/rolls')}>롤 목록으로</Button>
                </div>
            </PageLayout>
        );
    }

    const film = films.find((f) => f.id === roll.filmId);
    const camera = cameras.find((c) => c.id === roll.cameraId);

    const isActive = roll.status === 'active';
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    const startStr = fmt(roll.startedAt);
    const endStr = roll.finishedAt ? fmt(roll.finishedAt) : null;
    const dateStr = isActive
        ? `${startStr} ~`
        : endStr && endStr !== startStr
          ? `${startStr} ~ ${endStr}`
          : startStr;

    function handleDeleteRoll() {
        deleteRoll(roll!.id);
        navigate('/rolls', { replace: true });
    }

    async function copyRollDataPayload() {
        if (!roll) return;
        try {
            const result = await buildExifPayload(roll, camera, film, lenses);
            await navigator.clipboard.writeText(result);
            triggerCopied();
        } catch {
            triggerCopyError();
        }
    }

    return (
        <PageLayout
            title={film?.name ?? 'Roll'}
            showBack
            rightAction={
                <div className="flex items-center">
                    <button
                        onClick={copyRollDataPayload}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="EXIF 데이터 복사"
                    >
                        {copied ? (
                            <Check size={16} className="text-film-accent" />
                        ) : (
                            <ClipboardCopy size={16} />
                        )}
                    </button>
                    <button
                        onClick={() => setShowEditRoll(true)}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="롤 수정"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => setShowDeleteRoll(true)}
                        className="p-2 text-film-muted hover:text-film-danger transition-colors"
                        title="롤 삭제"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            }
        >
            <div className="px-4 py-4">
                {/* Roll meta */}
                <div className="bg-film-surface border border-film-border rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-film-accent animate-pulse" />
                                    <span className="text-film-accent font-mono text-xs uppercase tracking-widest">
                                        촬영 중
                                    </span>
                                </>
                            )}
                            {!isActive && (
                                <span className="text-film-muted font-mono text-xs uppercase tracking-widest">
                                    촬영 완료
                                </span>
                            )}
                        </div>
                        <span className="text-film-muted font-mono text-xs">{dateStr}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.frames.length}
                            </div>
                            <div className="text-film-muted font-mono text-xs">촬영됨</div>
                        </div>
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.maxFrames}
                            </div>
                            <div className="text-film-muted font-mono text-xs">전체</div>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-film-border text-film-muted font-mono text-xs flex items-center gap-1.5">
                        <Camera size={11} />
                        {camera?.name ?? '—'}
                    </div>
                    {roll.memo && (
                        <div className="mt-2 text-film-muted font-mono text-xs flex items-start gap-1.5">
                            <FileText size={11} className="shrink-0 mt-0.5" />
                            <span className="whitespace-pre-wrap break-words">{roll.memo}</span>
                        </div>
                    )}
                </div>

                {/* Go to shoot (if active) */}
                {isActive && (
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        className="mb-4"
                        onClick={() => {
                            setActiveRollId(roll.id);
                            navigate('/shoot');
                        }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Play size={14} />
                            촬영 계속하기
                        </span>
                    </Button>
                )}

                {/* Resume shooting (if finished) */}
                {!isActive && (
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        className="mb-4 muted-border"
                        onClick={() => setShowResumeConfirm(true)}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Play size={14} />
                            촬영 재개하기
                        </span>
                    </Button>
                )}

                {/* Frames list */}
                {roll.frames.length > 0 && (
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => setReversedFrames((v) => !v)}
                            className="flex items-center gap-1 font-mono text-xs text-film-muted hover:text-film-text focus:text-film-muted active:text-film-muted transition-colors outline-none"
                        >
                            <ArrowUpDown size={12} />
                            {reversedFrames ? '최신 순' : '오래된 순'}
                        </button>
                        <button
                            onClick={() => setShowAddFrame(true)}
                            className="flex items-center gap-1 font-mono text-xs text-film-accent hover:opacity-70 transition-opacity"
                        >
                            <Plus size={13} />
                            프레임 추가
                        </button>
                    </div>
                )}
                {roll.frames.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-film-border font-mono text-sm">기록된 컷이 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-film-surface border border-film-border rounded-xl px-4">
                        {(reversedFrames ? [...roll.frames].reverse() : roll.frames).map((frame) => (
                            <FrameItem
                                key={frame.id}
                                frame={frame}
                                onEdit={() => setEditingFrame(frame)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <EditFrameModal
                key={editingFrame?.id ?? ''}
                rollId={roll.id}
                frame={editingFrame}
                onClose={() => setEditingFrame(null)}
            />

            <EditRollModal
                key={showEditRoll ? roll.id : 'edit-roll-closed'}
                rollId={roll.id}
                isOpen={showEditRoll}
                onClose={() => setShowEditRoll(false)}
            />

            <AddFrameModal
                key={showAddFrame ? 'add-frame-open' : 'add-frame-closed'}
                rollId={roll.id}
                totalFrames={roll.frames.length}
                defaultAt={roll.frames.length + 1}
                isOpen={showAddFrame}
                onClose={() => setShowAddFrame(false)}
                onInserted={(frame) => setEditingFrame(frame)}
            />

            {/* Resume roll confirmation */}
            <ConfirmModal
                isOpen={showResumeConfirm}
                onClose={() => setShowResumeConfirm(false)}
                title="촬영을 재개할까요?"
                message="촬영이 마무리된 롤입니다. 촬영을 재개하시겠습니까?"
                cancelLabel="취소"
                confirmLabel="재개"
                onConfirm={() => {
                    resumeRoll(roll!.id);
                    setShowResumeConfirm(false);
                    navigate('/shoot');
                }}
            />

            <CopyToast copied={copied} copyError={copyError} fading={toastFading} />

            {/* Delete roll confirmation */}
            <ConfirmModal
                isOpen={showDeleteRoll}
                onClose={() => setShowDeleteRoll(false)}
                title="롤을 삭제할까요?"
                message={`이 롤과 기록된 ${roll.frames.length}컷을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.`}
                cancelLabel="취소"
                confirmLabel="삭제"
                variant="danger"
                onConfirm={handleDeleteRoll}
            />
        </PageLayout>
    );
}
