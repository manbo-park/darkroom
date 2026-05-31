import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

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

    // 촬영 화면처럼 스크롤이 없는 페이지는 동적 뷰포트(h-dvh)에 맞춘 flex 컬럼으로
    // 구성한다. body를 position:fixed로 바꾸면 iOS Safari가 100dvh를 재계산하며
    // 진입 직후 콘텐츠가 위로 튀고 하단에 공백이 생긴다. 고정 헤더 + 높이 계산 대신
    // 흐름상 헤더 + flex-1 본문으로 실제 가용 높이를 그대로 채운다.
    if (noScroll) {
        return (
            <div className="flex flex-col h-dvh overflow-hidden bg-film-bg">
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
