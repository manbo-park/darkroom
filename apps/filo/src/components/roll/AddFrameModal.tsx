import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useRollStore } from '@/store/rollStore';
import type { Frame } from '@/types';

interface AddFrameModalProps {
    rollId: string;
    totalFrames: number;
    defaultAt: number;
    isOpen: boolean;
    onClose: () => void;
    onInserted: (frame: Frame) => void;
}

export function AddFrameModal({
    rollId,
    totalFrames,
    defaultAt,
    isOpen,
    onClose,
    onInserted,
}: AddFrameModalProps) {
    const insertFrame = useRollStore((s) => s.insertFrame);
    const [at, setAt] = useState(defaultAt);

    function handleInsert() {
        const newId = insertFrame(rollId, at);
        onClose();
        const updatedRoll = useRollStore.getState().rolls.find((r) => r.id === rollId);
        const newFrame = updatedRoll?.frames.find((f) => f.id === newId);
        if (newFrame) onInserted(newFrame);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="프레임 추가">
            <div className="flex flex-col gap-4">
                <Select
                    label="삽입할 위치"
                    value={String(at)}
                    onChange={(e) => setAt(Number(e.target.value))}
                    options={Array.from({ length: totalFrames + 1 }, (_, i) => ({
                        value: String(i + 1),
                        label: `${i + 1}번`,
                    }))}
                />
                <div className="flex gap-3">
                    <Button variant="secondary" fullWidth onClick={onClose}>
                        취소
                    </Button>
                    <Button variant="primary" fullWidth onClick={handleInsert}>
                        추가
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
