import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, fieldClass, labelClass } from '@darkroom/ui';
import { useFrameStore } from '../store/useFrameStore';
import type { FrameMeta } from '../types/frame';
import { ComboboxField } from './ComboboxField';
import { APERTURE_PRESETS, SHUTTER_PRESETS, ISO_PRESETS } from '../lib/presets';

interface FieldRowProps {
    label: string;
    children: React.ReactNode;
}

function FieldRow({ label, children }: FieldRowProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    );
}

export function BulkEditPanel() {
    const { selectedIds, bulkEditOpen, setBulkEditOpen, batchUpdateMeta } = useFrameStore();

    const [closing, setClosing] = useState(false);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [lensModel, setLensModel] = useState('');
    const [fNumber, setFNumber] = useState('');
    const [exposureTime, setExposureTime] = useState('');
    const [iso, setIso] = useState('');
    const [userComment, setUserComment] = useState('');

    const [prevOpen, setPrevOpen] = useState(bulkEditOpen);

    // bulkEditOpen 전환을 렌더 중 즉시 반영한다 (effect 지연 없이).
    if (bulkEditOpen !== prevOpen) {
        setPrevOpen(bulkEditOpen);
        if (bulkEditOpen) {
            setClosing(false);
            setMake('');
            setModel('');
            setLensModel('');
            setFNumber('');
            setExposureTime('');
            setIso('');
            setUserComment('');
        } else {
            setClosing(true);
        }
    }

    useEffect(() => {
        if (bulkEditOpen && selectedIds.size === 0) {
            setBulkEditOpen(false);
        }
    }, [selectedIds.size, bulkEditOpen, setBulkEditOpen]);

    const handleClose = () => setBulkEditOpen(false);

    const handleAnimationEnd = () => {
        if (closing) setClosing(false);
    };

    const handleApply = () => {
        const patch: Partial<FrameMeta> = {};
        if (make !== '') patch.make = make || null;
        if (model !== '') patch.model = model || null;
        if (lensModel !== '') patch.lensModel = lensModel || null;
        if (fNumber !== '') {
            const n = parseFloat(fNumber);
            if (!isNaN(n)) patch.fNumber = n;
        }
        if (exposureTime !== '') patch.exposureTime = exposureTime || null;
        if (iso !== '') {
            const n = parseInt(iso, 10);
            if (!isNaN(n)) patch.iso = n;
        }
        if (userComment !== '') patch.userComment = userComment || null;

        if (Object.keys(patch).length > 0) {
            batchUpdateMeta([...selectedIds], patch);
        }
        setBulkEditOpen(false);
    };

    if (!bulkEditOpen && !closing) return null;

    return (
        <>
            <div className="fixed inset-0 z-30 bg-black/40" onClick={handleClose} />
            <aside
                className={`fixed right-4 top-4 bottom-4 w-80 bg-film-surface rounded-xl border border-film-border shadow-2xl flex flex-col z-40 overflow-hidden ${closing ? 'animate-slide-out' : 'animate-slide-in'}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="px-4 py-3 border-b border-film-border flex items-start justify-between gap-2 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-film-text font-semibold text-sm uppercase tracking-wider">
                            일괄 편집
                        </h2>
                        <p className="text-xs text-film-muted mt-0.5">
                            {selectedIds.size}개 선택됨
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        aria-label="닫기"
                        className="shrink-0 text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <p className="text-xs text-film-muted">
                        값을 입력한 필드만 선택된 프레임에 일괄 적용됩니다.
                    </p>

                    <Input
                        label="제조사 (Make)"
                        type="text"
                        value={make}
                        placeholder="변경하지 않음"
                        maxLength={64}
                        onChange={(e) => setMake(e.target.value)}
                    />

                    <Input
                        label="카메라 모델"
                        type="text"
                        value={model}
                        placeholder="변경하지 않음"
                        maxLength={64}
                        onChange={(e) => setModel(e.target.value)}
                    />

                    <Input
                        label="렌즈"
                        type="text"
                        value={lensModel}
                        placeholder="변경하지 않음"
                        maxLength={64}
                        onChange={(e) => setLensModel(e.target.value)}
                    />

                    <FieldRow label="조리개">
                        <ComboboxField
                            value={fNumber}
                            options={APERTURE_PRESETS}
                            placeholder="변경하지 않음"
                            onChange={setFNumber}
                        />
                    </FieldRow>

                    <FieldRow label="셔터 속도">
                        <ComboboxField
                            value={exposureTime}
                            options={SHUTTER_PRESETS}
                            placeholder="변경하지 않음"
                            onChange={setExposureTime}
                        />
                    </FieldRow>

                    <FieldRow label="ISO">
                        <ComboboxField
                            value={iso}
                            options={ISO_PRESETS}
                            placeholder="변경하지 않음"
                            onChange={setIso}
                        />
                    </FieldRow>

                    <FieldRow label="메모">
                        <textarea
                            value={userComment}
                            placeholder="변경하지 않음"
                            rows={3}
                            className={`${fieldClass} w-full resize-none`}
                            onChange={(e) => setUserComment(e.target.value)}
                        />
                    </FieldRow>
                </div>

                <div className="px-4 py-3 border-t border-film-border shrink-0">
                    <Button variant="primary" fullWidth onClick={handleApply}>
                        일괄 적용
                    </Button>
                </div>
            </aside>
        </>
    );
}
