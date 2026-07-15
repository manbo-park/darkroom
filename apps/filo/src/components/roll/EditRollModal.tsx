import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';

interface EditRollModalProps {
    rollId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function EditRollModal({ rollId, isOpen, onClose }: EditRollModalProps) {
    const updateRoll = useRollStore((s) => s.updateRoll);
    const roll = useRollStore((s) => s.rolls.find((r) => r.id === rollId));
    const { films, cameras } = useMasterDataStore(
        useShallow((s) => ({ films: s.films, cameras: s.cameras })),
    );

    const [filmId, setFilmId] = useState(() => roll?.filmId ?? '');
    const [cameraId, setCameraId] = useState(() => roll?.cameraId ?? '');
    const [maxFrames, setMaxFrames] = useState(() => (roll ? String(roll.maxFrames) : ''));
    const [memo, setMemo] = useState(() => roll?.memo ?? '');

    function save() {
        const frames = parseInt(maxFrames, 10);
        if (!filmId || !cameraId || !frames || frames < 1) return;
        updateRoll(rollId, {
            filmId,
            cameraId,
            maxFrames: frames,
            memo: memo || undefined,
        });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="롤 정보 수정">
            <div className="flex flex-col gap-4">
                <Select
                    label="필름"
                    value={filmId}
                    onChange={(e) => setFilmId(e.target.value)}
                    options={films.map((f) => ({ value: f.id, label: f.name }))}
                    placeholder="필름 선택..."
                />
                <Select
                    label="카메라"
                    value={cameraId}
                    onChange={(e) => setCameraId(e.target.value)}
                    options={cameras.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="카메라 선택..."
                />
                <Input
                    label="전체 프레임 수"
                    type="number"
                    value={maxFrames}
                    onChange={(e) => setMaxFrames(e.target.value)}
                    placeholder="36"
                />
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-film-muted uppercase tracking-wider">
                        메모
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 롤에 대한 메모..."
                        rows={3}
                        className="bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors resize-none"
                    />
                </div>
                <div className="flex gap-3 mt-1">
                    <Button variant="secondary" fullWidth onClick={onClose}>
                        취소
                    </Button>
                    <Button variant="primary" fullWidth onClick={save}>
                        저장
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
