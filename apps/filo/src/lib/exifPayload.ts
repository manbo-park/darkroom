import type { Roll, Camera, Film, Lens } from '@/types';

export async function buildExifPayload(
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
        const entry: Record<string, unknown> = { n: frame.frameNumber };
        if (frame.timestamp) entry.t = frame.timestamp;
        if (lens) entry.lens = lens.name;
        if (apertureNum != null && !isNaN(apertureNum)) entry.aperture = apertureNum;
        if (frame.shutterSpeed) entry.shutter = frame.shutterSpeed;
        if (frame.memo) entry.memo = frame.memo;
        if (frame.latitude != null) entry.lat = frame.latitude;
        if (frame.longitude != null) entry.lng = frame.longitude;
        return entry;
    });

    const payload = {
        v: 1,
        roll: {
            camera: { make: camera?.brand ?? '', model: camera?.name ?? '' },
            film: { name: film?.name ?? '', iso: film?.iso ?? 0 },
            frames,
        },
    };

    const json = JSON.stringify(payload);
    const encoded = new TextEncoder().encode(json);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(encoded);
    writer.close();
    const chunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        buf.set(chunk, offset);
        offset += chunk.length;
    }
    let binary = '';
    for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
    return 'FILO1:' + btoa(binary);
}
