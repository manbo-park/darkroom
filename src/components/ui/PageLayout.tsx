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

    // 촬영 화면처럼 스크롤이 없는 페이지는 fixed inset-0 루트로 구성한다.
    // 100dvh/innerHeight 같은 뷰포트 단위·메트릭은 콜드 스타트(스플래시 직후
    // 직행) 첫 페인트 시점에 상단 인셋만큼 짧은 값으로 잡히고 이후 보정되지
    // 않아 하단 공백이 생긴다. fixed inset-0는 브라우저가 뷰포트 박스에 직접
    // 맞춰 주므로(SplashScreen과 동일 패턴) 이 타이밍 문제의 영향을 받지 않는다.
    if (noScroll) {
        return (
            <div className="fixed inset-0 flex flex-col overflow-hidden bg-film-bg">
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
