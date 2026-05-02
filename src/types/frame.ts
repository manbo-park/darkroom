export interface FrameMeta {
    dateTimeOriginal: Date | null;
    make: string | null;
    model: string | null;
    lensModel: string | null;
    fNumber: number | null;
    exposureTime: number | null;
    iso: number | null;
    userComment: string | null;
}

export interface FrameItem {
    id: string;
    file: File;
    thumbnailUrl: string;
    frameNumber: number | null;
    meta: FrameMeta;
    originalMeta: FrameMeta;
    errors: Partial<Record<keyof FrameMeta, string>>;
}
