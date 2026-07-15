import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CopyToast } from '@/components/ui/CopyToast';
import { useClipboardToast } from '@/hooks/useClipboardToast';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import { toDateStr, toTimeStr, formatCoord } from '@/lib/format';
import { getApertureOptions, SHUTTER_OPTIONS } from '@/lib/frameOptions';
import type { Frame } from '@/types';


interface EditFrameModalProps {
    rollId: string;
    frame: Frame | null;
    onClose: () => void;
}

export function EditFrameModal({ rollId, frame, onClose }: EditFrameModalProps) {
    const { updateFrame, deleteFrame } = useRollStore(
        useShallow((s) => ({ updateFrame: s.updateFrame, deleteFrame: s.deleteFrame })),
    );
    const lenses = useMasterDataStore((s) => s.lenses);
    const prevFrameTimestamp = useRollStore((s) => {
        if (!frame) return null;
        const roll = s.rolls.find((r) => r.id === rollId);
        return roll?.frames[frame.frameNumber - 2]?.timestamp ?? null;
    });

    const [lensId, setLensId] = useState(() => frame?.lensId ?? '');
    const [aperture, setAperture] = useState(() => frame?.aperture ?? '');
    const [shutterSpeed, setShutterSpeed] = useState(() => frame?.shutterSpeed ?? '');
    const [memo, setMemo] = useState(() => frame?.memo ?? '');
    const [tsDate, setTsDate] = useState(() =>
        frame?.timestamp ? toDateStr(frame.timestamp) : '',
    );
    const [tsTime, setTsTime] = useState(() =>
        frame?.timestamp ? toTimeStr(frame.timestamp) : '',
    );
    const { copied, copyError, fading, triggerCopied, triggerCopyError } = useClipboardToast();

    const lens = lenses.find((l) => l.id === lensId);
    const apertureStop = lens?.apertureStop ?? '1';

    const currentTs = tsDate && tsTime ? new Date(`${tsDate}T${tsTime}`).toISOString() : null;
    const tsError = !!(
        prevFrameTimestamp &&
        currentTs &&
        currentTs.slice(0, 19) < prevFrameTimestamp.slice(0, 19)
    );

    function save() {
        if (!frame) return;
        updateFrame(rollId, frame.id, {
            lensId: lensId || undefined,
            aperture: aperture || undefined,
            shutterSpeed: shutterSpeed || undefined,
            memo: memo || undefined,
            timestamp: currentTs ?? undefined,
        });
        onClose();
    }

    function handleDelete() {
        if (!frame) return;
        deleteFrame(rollId, frame.id);
        onClose();
    }

    return (
        <>
            <Modal isOpen={!!frame} onClose={onClose} title={`${frame?.frameNumber ?? ''}번 프레임`}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs text-film-muted">촬영 시간</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={tsDate}
                                onChange={(e) => setTsDate(e.target.value)}
                                className="flex-1 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-sm text-film-text focus:outline-none focus:border-film-accent"
                            />
                            <input
                                type="time"
                                step="1"
                                value={tsTime}
                                onChange={(e) => setTsTime(e.target.value)}
                                className="w-32 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-sm text-film-text focus:outline-none focus:border-film-accent"
                            />
                        </div>
                        {tsError && (
                            <p className="font-mono text-xs text-film-warn">
                                이전 컷의 촬영 시간보다 이릅니다.
                            </p>
                        )}
                    </div>
                    <Select
                        label="렌즈"
                        value={lensId}
                        onChange={(e) => setLensId(e.target.value)}
                        options={lenses.map((l) => ({ value: l.id, label: l.name }))}
                        placeholder="렌즈 선택..."
                    />
                    <Select
                        label="조리개"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        options={getApertureOptions(apertureStop, lens?.maxAperture, aperture)}
                        placeholder="조리개 선택..."
                    />
                    <Select
                        label="셔터 속도"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        options={SHUTTER_OPTIONS}
                        placeholder="셔터 속도 선택..."
                    />
                    <Input
                        label="메모"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 컷에 대한 메모..."
                    />
                    {frame?.latitude != null && frame?.longitude != null && (
                        <div className="flex flex-col gap-1">
                            <label className="font-mono text-xs text-film-muted">위치 정보</label>
                            <button
                                onClick={() => {
                                    navigator.clipboard
                                        .writeText(`${frame!.latitude},${frame!.longitude}`)
                                        .then(triggerCopied, triggerCopyError);
                                }}
                                className="flex items-center gap-2 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-xs text-film-accent active:opacity-70 transition-opacity text-left"
                            >
                                <MapPin size={12} className="shrink-0" />
                                <span>
                                    {formatCoord(frame.latitude, true, 6)},&nbsp;
                                    {formatCoord(frame.longitude, false, 6)}
                                </span>
                                {frame.locationAccuracy != null && (
                                    <span className="ml-auto text-film-muted">
                                        ±{Math.round(frame.locationAccuracy)}m
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3 mt-1">
                        <Button variant="danger" size="md" fullWidth onClick={handleDelete}>
                            삭제
                        </Button>
                        <Button variant="primary" size="md" fullWidth onClick={save}>
                            저장
                        </Button>
                    </div>
                </div>
            </Modal>
            <CopyToast copied={copied} copyError={copyError} fading={fading} />
        </>
    );
}
