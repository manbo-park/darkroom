import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { readExif, readThumbnail } from '../lib/exif';
import { generateThumbnail } from '../lib/thumbnail';
import { extractFrameNumber } from '../lib/filename';
import { useFrameStore } from '../store/useFrameStore';
import type { FrameItem } from '../types/frame';

export function Dropzone() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectedNames, setRejectedNames] = useState<string[]>([]);
    const addFrames = useFrameStore((s) => s.addFrames);

    const processFiles = useCallback(
        async (files: File[]) => {
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
                    meta: { ...meta },
                    originalMeta: { ...meta },
                    errors: {},
                });
            }

            addFrames(newFrames);
            setIsProcessing(false);
        },
        [addFrames],
    );

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setRejectedNames(fileRejections.map((r) => r.file.name));
            if (acceptedFiles.length > 0) processFiles(acceptedFiles);
        },
        [processFiles],
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
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none ${
                    isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                }`}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <p className="text-gray-400 text-sm">EXIF 읽는 중...</p>
                ) : isDragActive ? (
                    <p className="text-blue-500 font-medium">여기에 놓으세요</p>
                ) : (
                    <div className="space-y-1">
                        <p className="text-gray-600 font-medium">
                            JPEG 파일을 드래그하거나 클릭하여 선택
                        </p>
                        <p className="text-gray-400 text-sm">.jpg · .jpeg 만 지원</p>
                    </div>
                )}
            </div>
            {rejectedNames.length > 0 && (
                <p className="mt-2 text-sm text-red-500">
                    지원하지 않는 파일: {rejectedNames.join(', ')}
                </p>
            )}
        </div>
    );
}
