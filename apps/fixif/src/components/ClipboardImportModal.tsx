import { useMemo, useState } from 'react';
import { Info, TriangleAlert } from 'lucide-react';
import { Button, Modal } from '@darkroom/ui';
import { useFrameStore } from '../store/useFrameStore';
import { useToastStore } from '../store/useToastStore';
import { matchFrames, filoFrameToMetaPatch } from '../lib/matching';

function formatTime(isoString: string): string {
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return '-';
    }
}

export function ClipboardImportModal() {
    const frames = useFrameStore((s) => s.frames);
    const pendingImport = useFrameStore((s) => s.pendingImport);
    const setPendingImport = useFrameStore((s) => s.setPendingImport);
    const applyImport = useFrameStore((s) => s.applyImport);
    const toast = useToastStore((s) => s.show);

    const [frameOffset, setFrameOffset] = useState(0);

    const matches = useMemo(() => {
        if (!pendingImport) return [];
        if (frameOffset === 0) return matchFrames(pendingImport.roll.frames, frames);

        const byNumber = new Map<number, (typeof frames)[number]>();
        for (const item of frames) {
            if (item.frameNumber !== null && !byNumber.has(item.frameNumber)) {
                byNumber.set(item.frameNumber, item);
            }
        }
        return pendingImport.roll.frames.map((ff) => {
            const shifted = ff.n + frameOffset;
            return {
                filoFrame: ff,
                frameItem: shifted >= 1 && shifted <= 99 ? (byNumber.get(shifted) ?? null) : null,
            };
        });
    }, [pendingImport, frames, frameOffset]);

    if (!pendingImport) return null;

    const { roll } = pendingImport;
    const matchedCount = matches.filter((m) => m.frameItem !== null).length;
    const unmatchedCount = matches.length - matchedCount;

    const handleApply = () => {
        const changes = matches
            .filter((m) => m.frameItem !== null)
            .map((m) => ({
                id: m.frameItem!.id,
                patch: filoFrameToMetaPatch(m.filoFrame, roll),
            }));
        applyImport(changes);
        setPendingImport(null);
        toast(`${changes.length}개 프레임에 filo 데이터를 적용했습니다`, 'success');
    };

    const handleClose = () => setPendingImport(null);

    const cameraLabel = [roll.camera?.make, roll.camera?.model].filter(Boolean).join(' ') || null;
    const filmLabel = roll.film?.name ?? null;
    const isoLabel = roll.film?.iso != null ? `ISO ${roll.film.iso}` : null;

    const footer = (
        <div className="space-y-2.5">
            {/* 프레임 오프셋 컨트롤 */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-film-muted">프레임 오프셋</span>
                <Button size="sm" onClick={() => setFrameOffset((o) => o - 1)}>
                    ← 당기기
                </Button>
                <span className="text-xs text-film-text w-8 text-center tabular-nums">
                    {frameOffset > 0 ? `+${frameOffset}` : frameOffset}
                </span>
                <Button size="sm" onClick={() => setFrameOffset((o) => o + 1)}>
                    밀기 →
                </Button>
            </div>
            {unmatchedCount > 0 && (
                <p className="text-xs text-film-warn flex items-center gap-1.5">
                    <TriangleAlert size={14} className="shrink-0" />
                    {unmatchedCount}개 filo 프레임이 파일과 매칭되지 않아 적용에서 제외됩니다
                </p>
            )}
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-film-muted">{matchedCount}개 프레임에 적용 예정</span>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleClose}>
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApply}
                        disabled={matchedCount === 0}
                    >
                        적용
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen
            onClose={handleClose}
            title={
                <>
                    <span className="normal-case">filo</span> 데이터 붙여넣기
                </>
            }
            layout="dialog"
            wide
            footer={footer}
        >
            <p className="text-xs text-film-muted mb-3">프레임 번호를 기준으로 자동 매칭됩니다</p>

            {/* 롤 요약 */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-film-muted mb-4">
                {cameraLabel && (
                    <span>
                        카메라 <span className="text-film-text">{cameraLabel}</span>
                    </span>
                )}
                {filmLabel && (
                    <span>
                        필름 <span className="text-film-text">{filmLabel}</span>
                    </span>
                )}
                {isoLabel && <span className="text-film-text">{isoLabel}</span>}
                <span className="ml-auto">
                    총 <span className="text-film-text">{roll.frames.length}</span>개 프레임
                </span>
            </div>

            {/* 매칭 테이블 */}
            <table className="w-full text-xs">
                <thead className="sticky -top-5 bg-film-surface border-b border-film-border text-left text-film-muted uppercase tracking-wider">
                    <tr>
                        <th className="px-3 py-2 font-normal w-16">프레임</th>
                        <th className="px-3 py-2 font-normal">파일</th>
                        <th className="px-3 py-2 font-normal w-32">촬영시간</th>
                        <th className="px-3 py-2 font-normal">렌즈</th>
                        <th className="px-3 py-2 font-normal w-16">f</th>
                        <th className="px-3 py-2 font-normal w-16">SS</th>
                        <th className="px-3 py-2 font-normal">메모</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-film-border">
                    {matches.map(({ filoFrame, frameItem }) => (
                        <tr
                            key={filoFrame.n}
                            className={
                                frameItem === null ? 'bg-film-danger/10' : 'hover:bg-film-border/50'
                            }
                        >
                            <td className="px-3 py-2.5 text-film-text tabular-nums">
                                {filoFrame.n}
                            </td>
                            <td className="px-3 py-2.5">
                                {frameItem ? (
                                    <span className="text-film-text">{frameItem.file.name}</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-film-danger">
                                        <Info size={12} className="shrink-0" />
                                        매칭 안됨
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-2.5 text-film-text tabular-nums">
                                {filoFrame.t ? formatTime(filoFrame.t) : '-'}
                            </td>
                            <td
                                className="px-3 py-2.5 text-film-text max-w-[140px] truncate"
                                title={filoFrame.lens ?? ''}
                            >
                                {filoFrame.lens ?? '-'}
                            </td>
                            <td className="px-3 py-2.5 text-film-text tabular-nums">
                                {filoFrame.aperture != null ? `f/${filoFrame.aperture}` : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-film-text tabular-nums">
                                {filoFrame.shutter ?? '-'}
                            </td>
                            <td
                                className="px-3 py-2.5 text-film-text max-w-[160px] truncate"
                                title={filoFrame.memo ?? ''}
                            >
                                {filoFrame.memo ?? '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Modal>
    );
}
