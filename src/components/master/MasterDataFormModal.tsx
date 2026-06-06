import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ApertureStop, Camera, Film, Lens } from '@/types';

export type MasterType = 'films' | 'cameras' | 'lenses';

export type MasterFormData = Omit<Film, 'id'> | Omit<Camera, 'id'> | Omit<Lens, 'id'>;

interface MasterDataFormModalProps {
    type: MasterType;
    initial?: Film | Camera | Lens | null; // 있으면 편집, 없으면 추가
    onClose: () => void;
    onSubmit: (data: MasterFormData) => void;
}

const APERTURE_STOPS: ApertureStop[] = ['1', '1/2', '1/3'];

const TYPE_LABEL: Record<MasterType, string> = {
    films: '필름',
    cameras: '카메라',
    lenses: '렌즈',
};

export function MasterDataFormModal({ type, initial, onClose, onSubmit }: MasterDataFormModalProps) {
    const isEdit = !!initial;
    const film = type === 'films' ? (initial as Film | null) : null;
    const camera = type === 'cameras' ? (initial as Camera | null) : null;
    const lens = type === 'lenses' ? (initial as Lens | null) : null;

    const [name, setName] = useState(initial?.name ?? '');
    const [iso, setIso] = useState(film ? String(film.iso) : '400');
    const [brand, setBrand] = useState(camera?.brand ?? '');
    const [apertureStop, setApertureStop] = useState<ApertureStop>(lens?.apertureStop ?? '1');
    const [maxAperture, setMaxAperture] = useState(
        lens?.maxAperture != null ? String(lens.maxAperture) : '',
    );

    function handleSubmit() {
        if (!name.trim()) return;
        if (type === 'films') {
            onSubmit({ name: name.trim(), iso: parseInt(iso) || 400 });
        } else if (type === 'cameras') {
            onSubmit({ name: name.trim(), ...(brand.trim() && { brand: brand.trim() }) });
        } else {
            const parsedMax = parseFloat(maxAperture);
            onSubmit({
                name: name.trim(),
                apertureStop,
                ...(Number.isFinite(parsedMax) && { maxAperture: parsedMax }),
            });
        }
        onClose();
    }

    return (
        <Modal isOpen onClose={onClose} title={`${TYPE_LABEL[type]} ${isEdit ? '편집' : '추가'}`}>
            <div className="flex flex-col gap-4">
                <Input
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                        type === 'films'
                            ? 'e.g., Kodak Gold 200'
                            : type === 'cameras'
                              ? 'e.g., Leica M6'
                              : 'e.g., Summicron 35mm f/2'
                    }
                    autoFocus
                />
                {type === 'films' && (
                    <Input
                        label="ISO"
                        type="number"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        placeholder="e.g., 400"
                    />
                )}
                {type === 'cameras' && (
                    <Input
                        label="제조사 (선택)"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., Leica"
                    />
                )}
                {type === 'lenses' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono text-film-muted uppercase tracking-wider">
                                조리개 스탑 단위
                            </label>
                            <div className="grid grid-cols-3 border border-film-border rounded-lg overflow-hidden">
                                {APERTURE_STOPS.map((stop) => (
                                    <button
                                        key={stop}
                                        type="button"
                                        onClick={() => setApertureStop(stop)}
                                        className={[
                                            'py-2.5 font-mono text-sm text-center transition-colors',
                                            apertureStop === stop
                                                ? 'accent-gradient-bg text-film-bg'
                                                : 'text-film-muted hover:text-film-text',
                                        ].join(' ')}
                                    >
                                        {stop}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Input
                            label="최대개방 f값 (선택)"
                            type="number"
                            step="0.1"
                            value={maxAperture}
                            onChange={(e) => setMaxAperture(e.target.value)}
                            placeholder="e.g., 2"
                        />
                    </>
                )}
                <div className="flex gap-3 mt-1">
                    <Button variant="secondary" size="md" fullWidth onClick={onClose}>
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        disabled={!name.trim()}
                        onClick={handleSubmit}
                    >
                        저장
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
