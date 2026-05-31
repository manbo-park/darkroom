import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';
import { DebugViewport } from '@/components/ui/DebugViewport';

interface PageLayoutProps {
    title: ReactNode;
    children: ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: ReactNode;
    className?: string;
    noScroll?: boolean;
}

export function PageLayout({
    title,
    children,
    showBack,
    onBack,
    rightAction,
    className = '',
    noScroll = false,
}: PageLayoutProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!noScroll) return;
        lockBodyScroll();
        return () => {
            unlockBodyScroll();
        };
    }, [noScroll]);

    const header = (
        <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                        className="text-film-muted hover:text-film-text transition-colors p-1 -ml-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-film-text font-mono font-semibold tracking-wider text-sm uppercase">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-2">{rightAction}</div>
        </div>
    );

    // 촬영 화면처럼 스크롤이 없는 페이지는 상단 고정 + 100svh 루트로 구성한다.
    // dvh/innerHeight는 다른 화면에서 재진입할 때 마운트 순간 상단 인셋을 포함한
    // 큰 값(전체 화면 높이)으로 잡혔다가 곧 수축해 콘텐츠가 위로 튄다. svh(작은
    // 뷰포트)는 콜드 스타트·재진입 모두에서 항상 동일한 값으로 안정적이므로,
    // 높이를 추적하지 않고 svh로 고정해 두 경우 모두 즉시 정확한 높이를 잡는다.
    if (noScroll) {
        return (
            <div className="fixed inset-x-0 top-0 h-svh flex flex-col overflow-hidden bg-film-bg">
                <DebugViewport />
                <header className="shrink-0 bg-film-bg border-b border-film-border px-4 pt-safe-top">
                    {header}
                </header>
                <main className={`flex-1 min-h-0 overflow-hidden ${className}`}>{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-film-bg">
            {/* Header — fixed so it stays put in PWA standalone mode */}
            <header className="fixed top-0 inset-x-0 z-10 bg-film-bg border-b border-film-border px-4 pt-safe-top">
                {header}
            </header>
            {/* Content — pt-header pushes content below the fixed header */}
            <main className={`pt-header ${className}`}>{children}</main>
        </div>
    );
}
