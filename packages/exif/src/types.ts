export interface GpsCoords {
    lat: number;
    lng: number;
}

// 표준 EXIF 필드만 담는다. 쓰기 시 값이 null인 필드는 해당 태그를 삭제한다.
export interface ExifMeta {
    dateTimeOriginal: Date | null;
    make: string | null;
    model: string | null;
    lensModel: string | null;
    fNumber: number | null;
    exposureTime: string | null;
    iso: number | null;
    userComment: string | null;
    gps: GpsCoords | null;
}
