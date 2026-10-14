import { useEffect, useEffectEvent, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from './scrollLock';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    /** sheet: 모바일 하단 시트(기본), dialog: 데스크톱 중앙 다이얼로그 */
    layout?: 'sheet' | 'dialog';
}

// 열린 모달 순서. Esc는 맨 위 모달만 닫아 아래 모달의 입력이 함께 사라지지 않게 한다.
const openStack: object[] = [];

export function Modal({ isOpen, onClose, title, children, layout = 'sheet' }: ModalProps) {
    const titleId = useId();
    const handleClose = useEffectEvent(onClose);

    useEffect(() => {
        if (!isOpen) return;
        const token = {};
        openStack.push(token);
        lockBodyScroll();
        const onKeyDown = (e: KeyboardEvent) => {
            // 한글 IME 조합 중 Esc는 조합 취소이므로 무시한다.
            if (e.key !== 'Escape' || e.isComposing || openStack[openStack.length - 1] !== token)
                return;
            handleClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            openStack.splice(openStack.indexOf(token), 1);
            unlockBodyScroll();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const isSheet = layout === 'sheet';

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center ${isSheet ? 'items-end' : 'items-center p-4'}`}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={[
                    'relative w-full max-w-lg bg-film-surface border border-film-border',
                    isSheet
                        ? 'rounded-t-2xl animate-slide-up pb-safe-bottom'
                        : 'rounded-2xl animate-fade-in',
                ].join(' ')}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                {isSheet && (
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-film-border" />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-film-border">
                    <h2
                        id={titleId}
                        className="text-film-text font-mono font-semibold text-sm uppercase tracking-wider"
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
