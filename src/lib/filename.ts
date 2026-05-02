export function extractFrameNumber(filename: string): number | null {
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
    const matches = nameWithoutExt.match(/\d+/g);
    if (!matches || matches.length === 0) return null;
    return parseInt(matches[matches.length - 1], 10);
}
