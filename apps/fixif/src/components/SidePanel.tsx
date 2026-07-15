import { useState } from 'react';
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
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            {children}
            {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputCls = (hasError?: boolean) =>
    `w-full px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-1 ${
        hasError
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'
    }`;

export function SidePanel() {
    const { frames, activeFrameId, setActiveFrameId, updateFrameMeta, updateFrameNumber } =
        useFrameStore();

    const [closing, setClosing] = useState(false);
    const [inputErrors, setInputErrors] = useState<{ fNumber?: string; exposureTime?: string; iso?: string }>({});
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
            <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setActiveFrameId(null)} />
            <aside
                className={`fixed right-4 top-4 bottom-4 w-80 bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col z-40 overflow-hidden ${closing ? 'animate-slide-out' : 'animate-slide-in'}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800">프레임 편집</h2>
                        <p
                            className="text-xs text-gray-400 mt-0.5 truncate"
                            title={displayFrame.file.name}
                        >
                            {displayFrame.file.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveFrameId(null)}
                        className="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 3l10 10M13 3L3 13" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* 프레임 번호 */}
                    <FieldRow label="프레임 번호">
                        <input
                            type="number"
                            min={1}
                            value={displayFrame.frameNumber ?? ''}
                            placeholder="자동"
                            className={inputCls()}
                            onChange={(e) =>
                                updateFrameNumber(
                                    displayFrame.id,
                                    e.target.value ? parseInt(e.target.value, 10) : null,
                                )
                            }
                        />
                    </FieldRow>

                    {/* 촬영시간 */}
                    <FieldRow label="촬영시간" error={errors.dateTimeOriginal}>
                        <input
                            type="datetime-local"
                            step="1"
                            value={toDatetimeLocal(meta.dateTimeOriginal)}
                            className={inputCls(!!errors.dateTimeOriginal)}
                            onChange={(e) => {
                                const val = e.target.value;
                                update({ dateTimeOriginal: val ? new Date(val) : null });
                            }}
                        />
                    </FieldRow>

                    {/* Make */}
                    <FieldRow label="제조사 (Make)" error={errors.make}>
                        <input
                            type="text"
                            value={meta.make ?? ''}
                            placeholder="예: Nikon"
                            maxLength={64}
                            className={inputCls(!!errors.make)}
                            onChange={(e) => update({ make: e.target.value || null })}
                        />
                    </FieldRow>

                    {/* Model */}
                    <FieldRow label="카메라 모델" error={errors.model}>
                        <input
                            type="text"
                            value={meta.model ?? ''}
                            placeholder="예: AF600"
                            maxLength={64}
                            className={inputCls(!!errors.model)}
                            onChange={(e) => update({ model: e.target.value || null })}
                        />
                    </FieldRow>

                    {/* LensModel */}
                    <FieldRow label="렌즈" error={errors.lensModel}>
                        <input
                            type="text"
                            value={meta.lensModel ?? ''}
                            placeholder="예: Summicron-M 50mm f/2"
                            maxLength={64}
                            className={inputCls(!!errors.lensModel)}
                            onChange={(e) => update({ lensModel: e.target.value || null })}
                        />
                    </FieldRow>

                    {/* 조리개 */}
                    <FieldRow label="조리개 (f/)" error={fNumberError}>
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
                                    setInputErrors((e) => ({ ...e, fNumber: '유효한 숫자를 입력하세요' }));
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
                                    setInputErrors((e) => ({ ...e, exposureTime: '셔터 속도 형식이 올바르지 않습니다' }));
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
                                    setInputErrors((e) => ({ ...e, iso: '유효한 숫자를 입력하세요' }));
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
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none"
                            onChange={(e) => update({ userComment: e.target.value || null })}
                        />
                    </FieldRow>
                </div>
            </aside>
        </>
    );
}
