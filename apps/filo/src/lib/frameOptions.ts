import type { ApertureStop } from '@/types';

// 항상 노출되는 기본 조리개 값 (풀스탑 + 초고속 렌즈용 f/0.95)
const FULL_STOP_APERTURES = [
    'f/0.95',
    'f/1.0',
    'f/1.4',
    'f/2',
    'f/2.8',
    'f/4',
    'f/5.6',
    'f/8',
    'f/11',
    'f/16',
    'f/22',
];

// 1/2스탑 단위 조리개 값 (풀스탑 사이 보간값, 설정에 따라 선택적으로 노출)
const HALF_STOP_APERTURES = [
    'f/1.2',
    'f/1.7',
    'f/2.4',
    'f/3.4',
    'f/4.8',
    'f/6.7',
    'f/9.5',
    'f/13',
    'f/19',
];

// 1/3스탑 단위 조리개 값 (풀스탑 사이 보간값, 설정에 따라 선택적으로 노출)
const THIRD_STOP_APERTURES = [
    'f/1.1',
    'f/1.2',
    'f/1.6',
    'f/1.8',
    'f/2.2',
    'f/2.5',
    'f/3.2',
    'f/3.5',
    'f/4.5',
    'f/5',
    'f/6.3',
    'f/7.1',
    'f/9',
    'f/10',
    'f/13',
    'f/14',
    'f/18',
    'f/20',
];

const toOption = (v: string) => ({ value: v, label: v });

// 'f/2.8' → 2.8 형태로 변환해 조리개 수치 기준 정렬에 사용한다.
const apertureValue = (v: string) => parseFloat(v.slice(2));

// 스탑 단위에 따라 base 조리개 목록을 구성한다.
function baseApertures(stop: ApertureStop): string[] {
    if (stop === '1/2') return [...FULL_STOP_APERTURES, ...HALF_STOP_APERTURES];
    if (stop === '1/3') return [...FULL_STOP_APERTURES, ...THIRD_STOP_APERTURES];
    return [...FULL_STOP_APERTURES];
}

// 스탑 단위·최대개방값에 따라 조리개 옵션 목록을 생성한다.
// - maxAperture가 있으면 그보다 밝은(f수가 작은) 값은 제외한다.
// - 이미 기록된 값(currentValue)은 단위·필터와 무관하게 표시·보존을 위해 항상 포함한다.
export function getApertureOptions(
    stop: ApertureStop,
    maxAperture?: number,
    currentValue?: string,
) {
    let values = baseApertures(stop);
    if (maxAperture != null) {
        values = values.filter((v) => apertureValue(v) >= maxAperture);
    }
    if (currentValue && !values.includes(currentValue)) {
        values.push(currentValue);
    }
    values.sort((a, b) => apertureValue(a) - apertureValue(b));
    return values.map(toOption);
}

export const SHUTTER_OPTIONS = [
    '1',
    '1/2',
    '1/4',
    '1/8',
    '1/15',
    '1/30',
    '1/60',
    '1/125',
    '1/250',
    '1/500',
    '1/1000',
    '1/2000',
    '1/4000',
    '1/8000',
].map(toOption);
