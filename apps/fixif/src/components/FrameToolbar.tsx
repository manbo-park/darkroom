import { useState, useRef } from 'react';
import { ClipboardPaste, LoaderCircle, Pencil, Redo2, Trash2, Undo2, Upload } from 'lucide-react';
import { Button, Modal, fieldClass } from '@darkroom/ui';
import { useFrameStore } from '../store/useFrameStore';
import { useToastStore } from '../store/useToastStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { exportFrames } from '../lib/export';
import { decodeClipboardPayload } from '../lib/clipboard';

export function FrameToolbar() {
    const frames = useFrameStore((s) => s.frames);
    const selectedIds = useFrameStore((s) => s.selectedIds);
    const removeFrames = useFrameStore((s) => s.removeFrames);
    const clearSelection = useFrameStore((s) => s.clearSelection);
    const setActiveFrameId = useFrameStore((s) => s.setActiveFrameId);
    const setBulkEditOpen = useFrameStore((s) => s.setBulkEditOpen);
    const setPendingImport = useFrameStore((s) => s.setPendingImport);
    const past = useFrameStore((s) => s.past);
    const future = useFrameStore((s) => s.future);
    const undo = useFrameStore((s) => s.undo);
    const redo = useFrameStore((s) => s.redo);
    const toast = useToastStore((s) => s.show);
    const exportSuffix = useSettingsStore((s) => s.exportSuffix);
    const includeGps = useSettingsStore((s) => s.includeGps);
    const includeMemo = useSettingsStore((s) => s.includeMemo);
    const [exporting, setExporting] = useState(false);
    const [filoInputOpen, setFiloInputOpen] = useState(false);
    const [filoText, setFiloText] = useState('');
    const [filoLoading, setFiloLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFiloOpen = () => {
        setFiloText('');
        setFiloInputOpen(true);
        setTimeout(() => textareaRef.current?.focus(), 50);
    };

    const handleFiloSubmit = async () => {
        const trimmed = filoText.trim();
        if (!trimmed) return;
        setFiloLoading(true);
        try {
            const payload = await decodeClipboardPayload(trimmed);
            if (!payload) {
                toast('유효하지 않은 Filo 데이터입니다');
                return;
            }
            setFiloInputOpen(false);
            setFiloText('');
            setPendingImport(payload);
        } finally {
            setFiloLoading(false);
        }
    };

    const targets = selectedIds.size > 0 ? frames.filter((f) => selectedIds.has(f.id)) : frames;
    const errorCount = targets.filter((f) => Object.keys(f.errors).length > 0).length;
    const canExport = errorCount === 0 && !exporting;

    const handleExport = async () => {
        if (!canExport) return;
        setExporting(true);
        try {
            await exportFrames(targets, exportSuffix, { includeGps, includeMemo });
            toast(
                targets.length > 1
                    ? `${targets.length}개 파일을 ZIP으로 내보냈습니다`
                    : `${targets[0].file.name} 파일을 내보냈습니다`,
                'success',
            );
        } catch (e) {
            console.error(e);
            toast('내보내기 중 오류가 발생했습니다');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="px-4 py-2.5 border-b border-film-border flex items-center gap-3 text-sm text-film-muted">
            <span>{frames.length}개 프레임</span>
            {selectedIds.size > 0 && (
                <span className="text-film-accent">{selectedIds.size}개 선택됨</span>
            )}

            <div className="flex items-center gap-0.5">
                <button
                    onClick={undo}
                    disabled={past.length === 0}
                    title="실행 취소 (Ctrl+Z)"
                    className="p-1.5 text-film-muted hover:text-film-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Undo2 size={16} />
                </button>
                <button
                    onClick={redo}
                    disabled={future.length === 0}
                    title="다시 실행 (Ctrl+Shift+Z)"
                    className="p-1.5 text-film-muted hover:text-film-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Redo2 size={16} />
                </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
                {selectedIds.size > 0 && (
                    <>
                        <Button
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => {
                                setActiveFrameId(null);
                                setBulkEditOpen(true);
                            }}
                        >
                            <Pencil size={16} />
                            일괄 편집
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => {
                                removeFrames([...selectedIds]);
                                clearSelection();
                            }}
                        >
                            <Trash2 size={16} />
                            제거
                        </Button>
                    </>
                )}
                {errorCount > 0 && (
                    <span className="text-xs text-film-danger">오류 {errorCount}개</span>
                )}
                <Button size="sm" className="flex items-center gap-1.5" onClick={handleFiloOpen}>
                    <ClipboardPaste size={16} />
                    filo 데이터 붙여넣기
                </Button>
                <span
                    title={
                        errorCount > 0
                            ? `오류가 있는 ${errorCount}개 행을 수정 후 내보낼 수 있습니다`
                            : targets.length > 1
                              ? `${targets.length}개 파일을 ZIP으로 내보내기`
                              : '파일 내보내기'
                    }
                >
                    <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1.5"
                        onClick={handleExport}
                        disabled={!canExport}
                    >
                        {exporting ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                처리 중…
                            </>
                        ) : (
                            <>
                                <Upload size={16} />새 파일로 내보내기
                            </>
                        )}
                    </Button>
                </span>
            </div>

            <Modal
                isOpen={filoInputOpen}
                onClose={() => setFiloInputOpen(false)}
                title={
                    <>
                        <span className="normal-case">filo</span> 데이터 붙여넣기
                    </>
                }
                layout="dialog"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-xs text-film-muted">
                        filo 앱에서 복사한 코드를 붙여넣으세요.
                    </p>
                    <textarea
                        ref={textareaRef}
                        value={filoText}
                        onChange={(e) => setFiloText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleFiloSubmit();
                        }}
                        placeholder="FILO1:..."
                        rows={4}
                        className={`${fieldClass} w-full resize-none`}
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => setFiloInputOpen(false)}>
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleFiloSubmit}
                            disabled={!filoText.trim() || filoLoading}
                        >
                            {filoLoading ? '처리 중…' : '불러오기'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
