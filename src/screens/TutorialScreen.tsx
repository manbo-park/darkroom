import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aperture, Database, Film, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';

interface Slide {
    icon?: LucideIcon;
    title: string;
    body: string;
}

const SLIDES: Slide[] = [
    {
        title: 'filo에 오신 것을 환영합니다',
        body: '필름 카메라 촬영 기록을 관리하는 앱입니다.\n모든 데이터는 서버 없이 기기에만 저장됩니다.',
    },
    {
        icon: Database,
        title: '기본 데이터',
        body: '롤 목록 우측 상단의 기본 데이터 메뉴에서\n사용하는 필름·카메라·렌즈를 먼저 등록하세요.',
    },
    {
        icon: Film,
        title: '롤',
        body: '필름과 카메라를 골라 새 롤을 장전하세요.\n다 찍은 롤은 목록에서 프레임별 기록을\n확인하고 편집할 수 있습니다.',
    },
    {
        icon: Aperture,
        title: '촬영',
        body: '셔터 버튼 한 번으로 프레임이 기록됩니다.\n조리개·셔터스피드·메모 같은 상세 정보도\n함께 남길 수 있습니다.',
    },
    {
        icon: Settings,
        title: '백업과 설정',
        body: '롤 목록 상단에서 기록을 파일로 내보내고\n다시 가져올 수 있습니다. 위치 기록 등\n세부 동작은 설정에서 조정하세요.',
    },
];

export function TutorialScreen() {
    const navigate = useNavigate();
    const setHasSeenTutorial = useSettingsStore((s) => s.setHasSeenTutorial);
    const [index, setIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);

    const isLast = index === SLIDES.length - 1;

    function goNext() {
        const track = trackRef.current;
        if (!track) return;
        track.scrollTo({ left: (index + 1) * track.clientWidth, behavior: 'smooth' });
    }

    function handleStart() {
        setHasSeenTutorial(true);
        navigate('/rolls', { replace: true });
    }

    return (
        <div className="fixed inset-0 bg-film-bg flex flex-col pt-safe-top pb-safe-bottom animate-fade-in">
            {/* 슬라이드 트랙 — CSS scroll-snap으로 스와이프 처리 */}
            <div
                ref={trackRef}
                onScroll={(e) => {
                    const el = e.currentTarget;
                    setIndex(Math.round(el.scrollLeft / el.clientWidth));
                }}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {SLIDES.map((slide) => (
                    <div
                        key={slide.title}
                        className="w-full shrink-0 snap-center flex flex-col items-center justify-center gap-6 px-10 text-center"
                    >
                        {slide.icon ? (
                            <slide.icon size={48} strokeWidth={1.5} className="text-film-accent" />
                        ) : (
                            <img
                                src="/filo-logo-white-with-shadow.png"
                                alt="filo"
                                className="h-24"
                            />
                        )}
                        <h2 className="text-film-text font-mono font-semibold text-lg tracking-wider">
                            {slide.title}
                        </h2>
                        <p className="text-film-muted font-mono text-sm leading-relaxed whitespace-pre-line">
                            {slide.body}
                        </p>
                    </div>
                ))}
            </div>

            {/* 인디케이터 + 하단 버튼 */}
            <div className="shrink-0 flex flex-col items-center gap-6 px-6 pb-8">
                <div className="flex gap-2">
                    {SLIDES.map((_, i) => (
                        <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i === index ? 'bg-film-accent' : 'bg-film-border'
                            }`}
                        />
                    ))}
                </div>
                {isLast ? (
                    <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
                        filo 시작하기
                    </Button>
                ) : (
                    <Button variant="secondary" size="lg" fullWidth onClick={goNext}>
                        다음
                    </Button>
                )}
            </div>
        </div>
    );
}
