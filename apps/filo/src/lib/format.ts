export function toDateStr(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeStr(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatCoord(val: number, isLat: boolean, decimals = 4): string {
    const dir = isLat ? (val >= 0 ? '°N' : '°S') : val >= 0 ? '°E' : '°W';
    return `${Math.abs(val).toFixed(decimals)}${dir}`;
}
