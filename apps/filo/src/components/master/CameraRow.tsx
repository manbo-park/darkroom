import { MasterRow } from './MasterRow';
import type { Camera } from '@/types';

interface CameraRowProps {
    camera: Camera;
    onEdit: () => void;
    onDelete: () => void;
}

export function CameraRow({ camera, onEdit, onDelete }: CameraRowProps) {
    return (
        <MasterRow onEdit={onEdit} onDelete={onDelete}>
            <span className="text-film-text font-mono text-sm">{camera.name}</span>
            {camera.brand && (
                <span className="text-film-muted font-mono text-xs ml-2">{camera.brand}</span>
            )}
        </MasterRow>
    );
}
