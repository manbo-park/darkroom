import type { FrameMeta } from '../types/frame';

const MAX_TEXT_LEN = 64;

function isValidShutter(s: string): boolean {
    if (s === 'B') return true;
    if (/^\d+(\.\d+)?"$/.test(s)) return parseFloat(s) >= 1;
    if (/^1\/\d+$/.test(s)) return parseInt(s.slice(2), 10) >= 1;
    return false;
}

export function validateMeta(meta: FrameMeta): Partial<Record<keyof FrameMeta, string>> {
    const errors: Partial<Record<keyof FrameMeta, string>> = {};
    const maxYear = new Date().getFullYear() + 1;

    if (meta.dateTimeOriginal !== null) {
        const y = meta.dateTimeOriginal.getFullYear();
        if (isNaN(y) || y < 1900 || y > maxYear) {
            errors.dateTimeOriginal = `1900~${maxYear}년 사이의 날짜를 입력하세요`;
        }
    }

    if (meta.fNumber !== null) {
        const decimals = (String(meta.fNumber).split('.')[1]?.length ?? 0);
        if (meta.fNumber <= 0 || decimals > 2) {
            errors.fNumber = '양의 수이며 소수점 둘째 자리 이내만 허용됩니다';
        }
    }

    if (meta.exposureTime !== null && meta.exposureTime !== '') {
        if (!isValidShutter(meta.exposureTime)) {
            errors.exposureTime = '셔터 속도는 1/N, N" 또는 B 형식이어야 합니다';
        }
    }

    if (meta.iso !== null) {
        if (!Number.isInteger(meta.iso) || meta.iso < 1) {
            errors.iso = 'ISO는 자연수여야 합니다';
        }
    }

    if (meta.make && meta.make.length > MAX_TEXT_LEN) {
        errors.make = `${MAX_TEXT_LEN}자 이내로 입력하세요`;
    }
    if (meta.model && meta.model.length > MAX_TEXT_LEN) {
        errors.model = `${MAX_TEXT_LEN}자 이내로 입력하세요`;
    }
    if (meta.lensModel && meta.lensModel.length > MAX_TEXT_LEN) {
        errors.lensModel = `${MAX_TEXT_LEN}자 이내로 입력하세요`;
    }

    return errors;
}
