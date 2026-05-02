import exifr from 'exifr';
import type { FrameMeta } from '../types/frame';

const EXIF_TAGS = [
    'DateTimeOriginal',
    'Make',
    'Model',
    'LensModel',
    'FNumber',
    'ExposureTime',
    'ISOSpeedRatings',
    'UserComment',
] as const;

export async function readExif(file: File): Promise<FrameMeta> {
    try {
        const data = await exifr.parse(file, { pick: [...EXIF_TAGS] });
        if (!data) return emptyMeta();

        return {
            dateTimeOriginal: data.DateTimeOriginal instanceof Date ? data.DateTimeOriginal : null,
            make: typeof data.Make === 'string' ? data.Make.trim() || null : null,
            model: typeof data.Model === 'string' ? data.Model.trim() || null : null,
            lensModel: typeof data.LensModel === 'string' ? data.LensModel.trim() || null : null,
            fNumber: typeof data.FNumber === 'number' ? data.FNumber : null,
            exposureTime: typeof data.ExposureTime === 'number' ? data.ExposureTime : null,
            iso: Array.isArray(data.ISOSpeedRatings)
                ? data.ISOSpeedRatings[0] ?? null
                : typeof data.ISOSpeedRatings === 'number'
                  ? data.ISOSpeedRatings
                  : null,
            userComment: typeof data.UserComment === 'string' ? data.UserComment || null : null,
        };
    } catch {
        return emptyMeta();
    }
}

export async function readThumbnail(file: File): Promise<string | null> {
    try {
        const thumb = await exifr.thumbnail(file);
        if (thumb) {
            const blob = new Blob([thumb], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
        }
    } catch {
        // no thumbnail in EXIF
    }
    return null;
}

function emptyMeta(): FrameMeta {
    return {
        dateTimeOriginal: null,
        make: null,
        model: null,
        lensModel: null,
        fNumber: null,
        exposureTime: null,
        iso: null,
        userComment: null,
    };
}
