import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { readExif, readThumbnail } from '@darkroom/exif';
import { generateThumbnail } from '../lib/thumbnail';
import { extractFrameNumber } from '../lib/filename';
import { useFrameStore } from '../store/useFrameStore';
import { useToastStore } from '../store/useToastStore';
import type { FrameItem } from '../types/frame';

export function Dropzone() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectedNames, setRejectedNames] = useState<string[]>([]);
    const frames = useFrameStore((s) => s.frames);
    const addFrames = useFrameStore((s) => s.addFrames);
    const toast = useToastStore((s) => s.show);

    const processFiles = useCallback(
        async (files: File[], skippedCount: number) => {
            setIsProcessing(true);
            const newFrames: FrameItem[] = [];

            for (const file of files) {
                const meta = await readExif(file);
                let thumbnailUrl = await readThumbnail(file);
                if (!thumbnailUrl) {
                    try {
                        thumbnailUrl = await generateThumbnail(file);
                    } catch {
                        thumbnailUrl = '';
                    }
                }

                newFrames.push({
                    id: crypto.randomUUID(),
                    file,
                    thumbnailUrl,
                    frameNumber: extractFrameNumber(file.name),
                    rotation: 0,
                    meta: { ...meta },
                    originalMeta: { ...meta },
                    errors: {},
                });
            }

            addFrames(newFrames);
            setIsProcessing(false);

            if (skippedCount > 0) {
                toast(`${newFrames.length}개 불러옴, ${skippedCount}개 중복으로 생략됨`);
            }
        },
        [addFrames, toast],
    );

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setRejectedNames(fileRejections.map((r) => r.file.name));
            if (acceptedFiles.length === 0) return;

            const existingNames = new Set(frames.map((f) => f.file.name));
            const newFiles = acceptedFiles.filter((f) => !existingNames.has(f.name));
            const skippedCount = acceptedFiles.length - newFiles.length;

            if (newFiles.length > 0) {
                processFiles(newFiles, skippedCount);
            } else {
                toast(`${skippedCount}개 파일이 이미 불러와져 있어 생략되었습니다.`);
            }
        },
        [frames, processFiles, toast],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
        multiple: true,
    });

    return (
        <div>
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl px-10 text-center cursor-pointer transition-colors select-none flex flex-col items-center justify-center min-h-32 ${
                    isDragActive
                        ? 'border-film-accent bg-film-accent/10'
                        : 'border-film-border bg-film-surface hover:border-film-muted'
                }`}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <p className="text-film-muted text-sm">EXIF 읽는 중...</p>
                ) : isDragActive ? (
                    <p className="text-film-accent">놓아서 불러오기</p>
                ) : (
                    <div className="space-y-1">
                        <p className="text-film-text">파일을 드래그하거나 클릭하여 불러오기</p>
                        <p className="text-film-muted text-sm">.jpg · .jpeg 만 지원</p>
                    </div>
                )}
            </div>
            {rejectedNames.length > 0 && (
                <p className="mt-2 text-sm text-film-danger">
                    지원하지 않는 파일: {rejectedNames.join(', ')}
                </p>
            )}
        </div>
    );
}
