import { MasterRow } from './MasterRow';
import type { Lens } from '@/types';

interface LensRowProps {
    lens: Lens;
    onEdit: () => void;
    onDelete: () => void;
}

export function LensRow({ lens, onEdit, onDelete }: LensRowProps) {
    return (
        <MasterRow onEdit={onEdit} onDelete={onDelete}>
            <span className="text-film-text font-mono text-sm">{lens.name}</span>
            {lens.apertureStop && lens.apertureStop !== '1' && (
                <span className="text-film-muted font-mono text-xs ml-2">
                    {lens.apertureStop} 스탑 단위
                </span>
            )}
            {lens.maxAperture != null && (
                <span className="text-film-muted font-mono text-xs ml-2">f/{lens.maxAperture}</span>
            )}
        </MasterRow>
    );
}
