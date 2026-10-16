// filo → fixif 클립보드 전송 형식: JSON → gzip → base64 → `FILO1:` prefix
// 암호화가 아닌 인코딩이므로 민감 정보를 담지 않는다.

export interface FiloFrame {
    n: number;
    t?: string;
    lens?: string;
    aperture?: number;
    shutter?: string;
    memo?: string;
    lat?: number;
    lng?: number;
}

export interface FiloPayload {
    v: 1;
    roll: {
        camera?: { make?: string; model?: string };
        film?: { name?: string; iso?: number };
        frames: FiloFrame[];
    };
}

// `1`은 스펙 버전. 스펙 변경 시 `FILO2:` 등으로 구분한다.
const PREFIX = 'FILO1:';

async function pipe(bytes: Uint8Array, transform: CompressionStream | DecompressionStream) {
    const stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeFiloPayload(payload: FiloPayload): Promise<string> {
    const json = new TextEncoder().encode(JSON.stringify(payload));
    const gz = await pipe(json, new CompressionStream('gzip'));
    let binary = '';
    for (let i = 0; i < gz.length; i++) binary += String.fromCharCode(gz[i]);
    return PREFIX + btoa(binary);
}

export async function decodeFiloPayload(text: string): Promise<FiloPayload | null> {
    if (!text.startsWith(PREFIX)) return null;
    try {
        const binary = atob(text.slice(PREFIX.length));
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const json = await pipe(bytes, new DecompressionStream('gzip'));
        const payload = JSON.parse(new TextDecoder().decode(json)) as FiloPayload;
        if (payload.v !== 1 || !payload.roll || !Array.isArray(payload.roll.frames)) return null;
        return payload;
    } catch {
        return null;
    }
}
