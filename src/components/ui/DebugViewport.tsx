import { useEffect, useRef, useState } from 'react';

/**
 * 임시 디버그 오버레이.
 * 콜드 스타트 시점과 정상 진입 시점의 뷰포트 관련 수치를 비교하기 위한 것으로,
 * 원인 확인 후 제거한다.
 */
interface Snapshot {
    innerH: number;
    outerH: number;
    vvH: number;
    vvTop: number;
    clientH: number;
    screenH: number;
}

function snapshot(): Snapshot {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    return {
        innerH: window.innerHeight,
        outerH: window.outerHeight,
        vvH: vv ? Math.round(vv.height) : -1,
        vvTop: vv ? Math.round(vv.offsetTop) : -1,
        clientH: document.documentElement.clientHeight,
        screenH: window.screen.height,
    };
}

export function DebugViewport() {
    // 첫 렌더(마운트) 시점에 즉시 읽히는 JS 값
    const [mount] = useState<Snapshot>(() => snapshot());
    const [live, setLive] = useState<Snapshot>(() => snapshot());

    // 프로브 기반 측정값 (CSS 단위가 실제로 몇 px로 해석되는지)
    const dvhRef = useRef<HTMLDivElement>(null);
    const svhRef = useRef<HTMLDivElement>(null);
    const lvhRef = useRef<HTMLDivElement>(null);
    const safeTopRef = useRef<HTMLDivElement>(null);
    const safeBottomRef = useRef<HTMLDivElement>(null);
    const [probe, setProbe] = useState({ dvh: 0, svh: 0, lvh: 0, safeTop: 0, safeBottom: 0 });
    const [probeMount, setProbeMount] = useState<typeof probe | null>(null);

    useEffect(() => {
        const readProbe = () => ({
            dvh: dvhRef.current?.offsetHeight ?? 0,
            svh: svhRef.current?.offsetHeight ?? 0,
            lvh: lvhRef.current?.offsetHeight ?? 0,
            safeTop: safeTopRef.current?.offsetHeight ?? 0,
            safeBottom: safeBottomRef.current?.offsetHeight ?? 0,
        });
        const update = () => {
            setLive(snapshot());
            setProbe(readProbe());
        };
        // 마운트 직후 프로브 값 1회 고정 기록
        setProbeMount(readProbe());
        update();
        const raf = requestAnimationFrame(update);
        const t = setTimeout(update, 500);
        window.addEventListener('resize', update);
        window.visualViewport?.addEventListener('resize', update);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t);
            window.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('resize', update);
        };
    }, []);

    const row = (label: string, a: number, b: number) => (
        <div className="flex justify-between gap-3">
            <span className="text-yellow-300">{label}</span>
            <span>
                <span className="text-cyan-300">{a}</span>
                <span className="text-neutral-500"> / {b}</span>
            </span>
        </div>
    );

    return (
        <>
            {/* CSS 단위 해석값 측정용 프로브 (보이지 않음) */}
            <div ref={dvhRef} style={{ position: 'absolute', visibility: 'hidden', height: '100dvh', width: 0 }} />
            <div ref={svhRef} style={{ position: 'absolute', visibility: 'hidden', height: '100svh', width: 0 }} />
            <div ref={lvhRef} style={{ position: 'absolute', visibility: 'hidden', height: '100lvh', width: 0 }} />
            <div ref={safeTopRef} style={{ position: 'absolute', visibility: 'hidden', height: 'env(safe-area-inset-top)', width: 0 }} />
            <div ref={safeBottomRef} style={{ position: 'absolute', visibility: 'hidden', height: 'env(safe-area-inset-bottom)', width: 0 }} />

            <div className="fixed top-20 left-2 z-[100] rounded-lg bg-black/85 px-3 py-2 font-mono text-[10px] leading-relaxed text-white pointer-events-none">
                <div className="mb-1 text-neutral-400">live / mount</div>
                {row('innerH', live.innerH, mount.innerH)}
                {row('vvH', live.vvH, mount.vvH)}
                {row('vvTop', live.vvTop, mount.vvTop)}
                {row('clientH', live.clientH, mount.clientH)}
                {row('outerH', live.outerH, mount.outerH)}
                {row('screenH', live.screenH, mount.screenH)}
                {row('dvh', probe.dvh, probeMount?.dvh ?? 0)}
                {row('svh', probe.svh, probeMount?.svh ?? 0)}
                {row('lvh', probe.lvh, probeMount?.lvh ?? 0)}
                {row('safeTop', probe.safeTop, probeMount?.safeTop ?? 0)}
                {row('safeBot', probe.safeBottom, probeMount?.safeBottom ?? 0)}
            </div>
        </>
    );
}
