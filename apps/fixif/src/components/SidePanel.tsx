import { useState } from 'react';
import { X } from 'lucide-react';
import { Input, fieldClass, labelClass } from '@darkroom/ui';
import { useFrameStore } from '../store/useFrameStore';
import type { FrameItem, FrameMeta } from '../types/frame';
import { ComboboxField } from './ComboboxField';
import { APERTURE_PRESETS, SHUTTER_PRESETS, ISO_PRESETS } from '../lib/presets';

function toDatetimeLocal(date: Date | null): string {
    if (!date) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

interface FieldRowProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

function FieldRow({ label, error, children }: FieldRowProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{label}</label>
            {children}
            {error && <span className="text-film-danger text-xs font-mono">{error}</span>}
        </div>
    );
}

export function SidePanel() {
    const { frames, activeFrameId, setActiveFrameId, updateFrameMeta, updateFrameNumber } =
        useFrameStore();

    const [closing, setClosing] = useState(false);
    const [inputErrors, setInputErrors] = useState<{
        fNumber?: string;
        exposureTime?: string;
        iso?: string;
    }>({});
    const [cachedFrame, setCachedFrame] = useState<FrameItem | null>(null);
    const [prevActiveId, setPrevActiveId] = useState<string | null>(activeFrameId);

    const frame = frames.find((f) => f.id === activeFrameId) ?? null;

    // 활성 프레임을 상태 캐시에 보관 — 닫힘 애니메이션 중에도 마지막 프레임을 계속 표시한다.
    if (frame && frame !== cachedFrame) setCachedFrame(frame);

    // activeFrameId 전환을 렌더 중 즉시 반영한다 (effect 지연 없이).
    if (activeFrameId !== prevActiveId) {
        setPrevActiveId(activeFrameId);
        if (activeFrameId) {
            setClosing(false);
            setInputErrors({});
        } else if (prevActiveId) {
            setClosing(true);
        }
    }

    const handleAnimationEnd = () => {
        if (closing) {
            setClosing(false);
            setCachedFrame(null);
        }
    };

    const displayFrame = frame ?? cachedFrame;
    if (!displayFrame) return null;

    const { meta, errors } = displayFrame;
    const update = (patch: Partial<FrameMeta>) => updateFrameMeta(displayFrame.id, patch);

    const fNumberError = inputErrors.fNumber ?? errors.fNumber;
    const exposureTimeError = inputErrors.exposureTime ?? errors.exposureTime;
    const isoError = inputErrors.iso ?? errors.iso;

    return (
        <>
            <div
                className="fixed inset-0 z-30 bg-black/40"
                onClick={() => setActiveFrameId(null)}
            />
            <aside
                className={`fixed right-4 top-4 bottom-4 w-80 bg-film-surface rounded-xl border border-film-border shadow-2xl flex flex-col z-40 overflow-hidden ${closing ? 'animate-slide-out' : 'animate-slide-in'}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="px-4 py-3 border-b border-film-border flex items-start justify-between gap-2 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-film-text font-semibold text-sm uppercase tracking-wider">
                            프레임 편집
                        </h2>
                        <p
                            className="text-xs text-film-muted mt-0.5 truncate"
                            title={displayFrame.file.name}
                        >
                            {displayFrame.file.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveFrameId(null)}
                        aria-label="닫기"
                        className="shrink-0 text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* 프레임 번호 */}
                    <Input
                        label="프레임 번호"
                        type="number"
                        min={1}
                        value={displayFrame.frameNumber ?? ''}
                        placeholder="자동"
                        onChange={(e) =>
                            updateFrameNumber(
                                displayFrame.id,
                                e.target.value ? parseInt(e.target.value, 10) : null,
                            )
                        }
                    />

                    {/* 촬영시간 */}
                    <Input
                        label="촬영시간"
                        error={errors.dateTimeOriginal}
                        type="datetime-local"
                        step="1"
                        value={toDatetimeLocal(meta.dateTimeOriginal)}
                        onChange={(e) => {
                            const val = e.target.value;
                            update({ dateTimeOriginal: val ? new Date(val) : null });
                        }}
                    />

                    {/* Make */}
                    <Input
                        label="제조사 (Make)"
                        error={errors.make}
                        type="text"
                        value={meta.make ?? ''}
                        placeholder="예: Nikon"
                        maxLength={64}
                        onChange={(e) => update({ make: e.target.value || null })}
                    />

                    {/* Model */}
                    <Input
                        label="카메라 모델"
                        error={errors.model}
                        type="text"
                        value={meta.model ?? ''}
                        placeholder="예: AF600"
                        maxLength={64}
                        onChange={(e) => update({ model: e.target.value || null })}
                    />

                    {/* LensModel */}
                    <Input
                        label="렌즈"
                        error={errors.lensModel}
                        type="text"
                        value={meta.lensModel ?? ''}
                        placeholder="예: Summicron-M 50mm f/2"
                        maxLength={64}
                        onChange={(e) => update({ lensModel: e.target.value || null })}
                    />

                    {/* 조리개 */}
                    <FieldRow label="조리개" error={fNumberError}>
                        <ComboboxField
                            value={meta.fNumber != null ? String(meta.fNumber) : ''}
                            options={APERTURE_PRESETS}
                            placeholder="예: 2.8"
                            error={fNumberError}
                            onChange={(val) => {
                                if (val === '') {
                                    setInputErrors((e) => ({ ...e, fNumber: undefined }));
                                    update({ fNumber: null });
                                    return;
                                }
                                if (!/^\d+(\.\d{1,2})?$/.test(val)) {
                                    setInputErrors((e) => ({
                                        ...e,
                                        fNumber: '유효한 숫자를 입력하세요',
                                    }));
                                } else {
                                    setInputErrors((e) => ({ ...e, fNumber: undefined }));
                                    update({ fNumber: parseFloat(val) });
                                }
                            }}
                        />
                    </FieldRow>

                    {/* 셔터 속도 */}
                    <FieldRow label="셔터 속도" error={exposureTimeError}>
                        <ComboboxField
                            value={meta.exposureTime ?? ''}
                            options={SHUTTER_PRESETS}
                            placeholder="예: 1/125"
                            error={exposureTimeError}
                            onChange={(val) => {
                                if (!val) {
                                    setInputErrors((e) => ({ ...e, exposureTime: undefined }));
                                    update({ exposureTime: null });
                                    return;
                                }
                                if (!/^(B|\d+(\.\d+)?"|(1\/\d+))$/.test(val)) {
                                    setInputErrors((e) => ({
                                        ...e,
                                        exposureTime: '셔터 속도 형식이 올바르지 않습니다',
                                    }));
                                } else {
                                    setInputErrors((e) => ({ ...e, exposureTime: undefined }));
                                    update({ exposureTime: val });
                                }
                            }}
                        />
                    </FieldRow>

                    {/* ISO */}
                    <FieldRow label="ISO" error={isoError}>
                        <ComboboxField
                            value={meta.iso != null ? String(meta.iso) : ''}
                            options={ISO_PRESETS}
                            placeholder="예: 400"
                            error={isoError}
                            onChange={(val) => {
                                if (val === '') {
                                    setInputErrors((e) => ({ ...e, iso: undefined }));
                                    update({ iso: null });
                                    return;
                                }
                                if (!/^\d+$/.test(val)) {
                                    setInputErrors((e) => ({
                                        ...e,
                                        iso: '유효한 숫자를 입력하세요',
                                    }));
                                } else {
                                    setInputErrors((e) => ({ ...e, iso: undefined }));
                                    update({ iso: parseInt(val, 10) });
                                }
                            }}
                        />
                    </FieldRow>

                    {/* 메모 */}
                    <FieldRow label="메모">
                        <textarea
                            value={meta.userComment ?? ''}
                            placeholder="메모를 입력하세요"
                            rows={3}
                            className={`${fieldClass} w-full resize-none`}
                            onChange={(e) => update({ userComment: e.target.value || null })}
                        />
                    </FieldRow>
                </div>
            </aside>
        </>
    );
}
