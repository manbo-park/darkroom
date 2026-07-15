import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    onConfirm: () => void;
}

export function ConfirmModal({
    isOpen,
    onClose,
    title,
    message,
    confirmLabel = '확인',
    cancelLabel,
    variant = 'primary',
    onConfirm,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-4">
                <div className="text-film-muted font-mono text-sm">{message}</div>
                <div className="flex gap-3">
                    {cancelLabel && (
                        <Button variant="secondary" fullWidth onClick={onClose}>
                            {cancelLabel}
                        </Button>
                    )}
                    <Button variant={variant} fullWidth onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
