import type { ExifMeta } from '@darkroom/exif';

export type { GpsCoords } from '@darkroom/exif';

// ponytail: 필드가 표준 EXIF와 1:1이라 매핑 없이 별칭만 둔다. 앱 전용 필드가 생기면 분리.
export type FrameMeta = ExifMeta;

export interface FrameItem {
    id: string;
    file: File;
    thumbnailUrl: string;
    frameNumber: number | null;
    rotation: 0 | 90 | 180 | 270;
    meta: FrameMeta;
    originalMeta: FrameMeta;
    errors: Partial<Record<keyof FrameMeta, string>>;
}
