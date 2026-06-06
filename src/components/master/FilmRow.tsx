import { MasterRow } from './MasterRow';
import type { Film } from '@/types';

interface FilmRowProps {
    film: Film;
    onEdit: () => void;
    onDelete: () => void;
}

export function FilmRow({ film, onEdit, onDelete }: FilmRowProps) {
    return (
        <MasterRow onEdit={onEdit} onDelete={onDelete}>
            <span className="text-film-text font-mono text-sm">{film.name}</span>
            <span className="text-film-muted font-mono text-xs ml-2">ISO {film.iso}</span>
        </MasterRow>
    );
}
