import { Check } from 'lucide-react';

interface CopyToastProps {
    copied: boolean;
    copyError: boolean;
    fading: boolean;
}

export function CopyToast({ copied, copyError, fading }: CopyToastProps) {
    if (!copied && !copyError) return null;
    const fadeClass = fading ? 'opacity-0' : 'opacity-100';
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {copied && (
                <div
                    className={`animate-slide-up flex items-center gap-2 bg-film-surface border border-film-border rounded-full px-4 py-2 shadow-lg transition-opacity duration-500 ${fadeClass}`}
                >
                    <Check size={13} className="text-film-accent shrink-0" />
                    <span className="font-mono text-xs text-film-text whitespace-nowrap">
                        데이터가 클립보드에 복사되었습니다.
                    </span>
                </div>
            )}
            {copyError && (
                <div
                    className={`animate-slide-up flex items-center gap-2 bg-film-surface border border-film-danger rounded-full px-4 py-2 shadow-lg transition-opacity duration-500 ${fadeClass}`}
                >
                    <span className="font-mono text-xs text-film-danger whitespace-nowrap">
                        복사에 실패했습니다. 브라우저가 지원하지 않을 수 있습니다.
                    </span>
                </div>
            )}
        </div>
    );
}
