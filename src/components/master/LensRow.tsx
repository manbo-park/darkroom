import { useState } from 'react';
import { MasterRow } from './MasterRow';
import type { Lens, ApertureStop } from '@/types';

interface LensRowProps {
    lens: Lens;
    onUpdate: (patch: Partial<Omit<Lens, 'id'>>) => void;
    onDelete: () => void;
}

const APERTURE_STOPS: ApertureStop[] = ['1', '1/2', '1/3'];

export function LensRow({ lens, onUpdate, onDelete }: LensRowProps) {
    const [name, setName] = useState(lens.name);
    const [apertureStop, setApertureStop] = useState<ApertureStop>(lens.apertureStop ?? '1');
    const [maxAperture, setMaxAperture] = useState(
        lens.maxAperture != null ? String(lens.maxAperture) : '',
    );

    return (
        <MasterRow
            onDelete={onDelete}
            onSave={() => {
                if (!name.trim()) return false;
                const parsedMax = parseFloat(maxAperture);
                onUpdate({
                    name: name.trim(),
                    apertureStop,
                    maxAperture: Number.isFinite(parsedMax) ? parsedMax : undefined,
                });
                return true;
            }}
            viewContent={
                <>
                    <span className="text-film-text font-mono text-sm">{lens.name}</span>
                    {lens.apertureStop && (
                        <span className="text-film-muted font-mono text-xs ml-2">
                            {lens.apertureStop}스탑
                        </span>
                    )}
                    {lens.maxAperture != null && (
                        <span className="text-film-muted font-mono text-xs ml-2">
                            f/{lens.maxAperture}
                        </span>
                    )}
                </>
            }
            editFields={(handleSave) => (
                <div className="flex-1 flex flex-col gap-1">
                    <input
                        className="w-full bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="렌즈 이름"
                    />
                    <div className="flex gap-1">
                        <div className="grid grid-cols-3 border border-film-border rounded overflow-hidden shrink-0">
                            {APERTURE_STOPS.map((stop) => (
                                <button
                                    key={stop}
                                    type="button"
                                    onClick={() => setApertureStop(stop)}
                                    className={[
                                        'px-2 py-1 font-mono text-xs text-center transition-colors',
                                        apertureStop === stop
                                            ? 'accent-gradient-bg text-film-bg'
                                            : 'text-film-muted hover:text-film-text',
                                    ].join(' ')}
                                >
                                    {stop}
                                </button>
                            ))}
                        </div>
                        <input
                            className="flex-1 min-w-0 bg-film-bg border border-film-border rounded px-2 py-1 text-film-text font-mono text-xs focus:outline-none focus:border-film-accent"
                            value={maxAperture}
                            onChange={(e) => setMaxAperture(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            type="number"
                            step="0.1"
                            placeholder="최대개방 f값 (선택)"
                        />
                    </div>
                </div>
            )}
        />
    );
}
