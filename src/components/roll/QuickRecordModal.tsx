import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { APERTURE_OPTIONS, SHUTTER_OPTIONS } from '@/lib/frameOptions';
import { useRollStore } from '@/store/rollStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Frame } from '@/types';

interface QuickRecordModalProps {
    rollId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (patch: Partial<Pick<Frame, 'aperture' | 'shutterSpeed' | 'memo'>>) => void;
}

export function QuickRecordModal({ rollId, isOpen, onClose, onSave }: QuickRecordModalProps) {
    const carryOverExposure = useSettingsStore((s) => s.carryOverExposure);
    const lastFrame = useRollStore((s) => {
        const roll = s.rolls.find((r) => r.id === rollId);
        const frames = roll?.frames;
        return frames ? (frames[frames.length - 1] ?? null) : null;
    });

    const [aperture, setAperture] = useState(() =>
        carryOverExposure ? (lastFrame?.aperture ?? '') : '',
    );
    const [shutterSpeed, setShutterSpeed] = useState(() =>
        carryOverExposure ? (lastFrame?.shutterSpeed ?? '') : '',
    );
    const [memo, setMemo] = useState('');

    function handleSave() {
        onSave({
            aperture: aperture || undefined,
            shutterSpeed: shutterSpeed || undefined,
            memo: memo || undefined,
        });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="빠른 상세 기록">
            <div className="flex flex-col gap-4">
                <Select
                    label="조리개"
                    value={aperture}
                    onChange={(e) => setAperture(e.target.value)}
                    options={APERTURE_OPTIONS}
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
                <div className="flex gap-3 mt-1">
                    <Button variant="secondary" size="md" fullWidth onClick={onClose}>
                        취소
                    </Button>
                    <Button variant="primary" size="md" fullWidth onClick={handleSave}>
                        저장
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
