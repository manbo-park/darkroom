import { encodeFiloPayload, type FiloFrame } from '@darkroom/filo-payload';
import type { Roll, Camera, Film, Lens } from '@/types';

export function buildExifPayload(
    roll: Roll,
    camera: Camera | undefined,
    film: Film | undefined,
    lenses: Lens[],
): Promise<string> {
    const frames = roll.frames.map((frame) => {
        const lens = lenses.find((l) => l.id === frame.lensId);
        const apertureNum = frame.aperture
            ? parseFloat(frame.aperture.replace('f/', ''))
            : undefined;
        const entry: FiloFrame = { n: frame.frameNumber };
        if (frame.timestamp) entry.t = frame.timestamp;
        if (lens) entry.lens = lens.name;
        if (apertureNum != null && !isNaN(apertureNum)) entry.aperture = apertureNum;
        if (frame.shutterSpeed) entry.shutter = frame.shutterSpeed;
        if (frame.memo) entry.memo = frame.memo;
        if (frame.latitude != null) entry.lat = frame.latitude;
        if (frame.longitude != null) entry.lng = frame.longitude;
        return entry;
    });

    return encodeFiloPayload({
        v: 1,
        roll: {
            camera: { make: camera?.brand ?? '', model: camera?.name ?? '' },
            film: { name: film?.name ?? '', iso: film?.iso ?? 0 },
            frames,
        },
    });
}
