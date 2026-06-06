import type { ReactNode } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface MasterRowProps {
    onEdit: () => void;
    onDelete: () => void;
    children: ReactNode; // 표시 내용
}

export function MasterRow({ onEdit, onDelete, children }: MasterRowProps) {
    return (
        <div className="flex items-center gap-2 py-2.5 border-b border-film-border last:border-b-0">
            <div className="flex-1 min-w-0">{children}</div>
            <button
                onClick={onEdit}
                className="text-film-muted hover:text-film-text p-1"
            >
                <Edit3 size={14} />
            </button>
            <button onClick={onDelete} className="text-film-muted hover:text-film-danger p-1">
                <Trash2 size={14} />
            </button>
        </div>
    );
}
