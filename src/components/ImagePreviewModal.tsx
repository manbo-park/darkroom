import { useEffect, useState } from 'react';

interface ImagePreviewModalProps {
    file: File;
    onClose: () => void;
}

export function ImagePreviewModal({ file, onClose }: ImagePreviewModalProps) {
    const [url, setUrl] = useState('');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={onClose}
            >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3l10 10M13 3L3 13" />
                </svg>
            </button>

            {!loaded && (
                <svg
                    className="w-10 h-10 text-white/50 animate-spin absolute"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
            )}

            <img
                src={url}
                alt={file.name}
                className={`max-h-[88vh] max-w-[92vw] object-contain rounded shadow-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 min-h-[30vh]'}`}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
                onLoad={() => setLoaded(true)}
            />

            <p className="mt-3 text-sm text-white/60 select-none">{file.name}</p>
        </div>
    );
}
