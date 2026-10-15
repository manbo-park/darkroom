import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
    message: ReactNode;
    tone?: 'success' | 'error';
    /** true면 페이드아웃 (언마운트 타이밍은 호출자가 관리) */
    fading?: boolean;
    /** 지정하면 닫기 버튼을 표시 */
    onClose?: () => void;
}

export function Toast({ message, tone = 'success', fading = false, onClose }: ToastProps) {
    const isError = tone === 'error';
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div
                role={isError ? 'alert' : 'status'}
                className={[
                    'animate-slide-up flex items-center gap-2 bg-film-surface border rounded-full px-4 py-2 shadow-lg transition-opacity duration-500',
                    isError ? 'border-film-danger' : 'border-film-border',
                    fading ? 'opacity-0' : 'opacity-100',
                    onClose ? 'pointer-events-auto' : '',
                ].join(' ')}
            >
                {!isError && <Check size={13} className="text-film-accent shrink-0" />}
                <span
                    className={`font-mono text-xs whitespace-nowrap ${isError ? 'text-film-danger' : 'text-film-text'}`}
                >
                    {message}
                </span>
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="닫기"
                        className="text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}
