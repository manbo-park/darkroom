import { useEffect, useRef, useState } from 'react';

export function useClipboardToast() {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const [fading, setFading] = useState(false);
    const timers = useRef<number[]>([]);

    useEffect(
        () => () => {
            timers.current.forEach(clearTimeout);
        },
        [],
    );

    function schedule() {
        timers.current.forEach(clearTimeout);
        setFading(false);
        timers.current = [
            window.setTimeout(() => setFading(true), 1800),
            window.setTimeout(() => {
                setCopied(false);
                setCopyError(false);
            }, 2400),
        ];
    }

    function triggerCopied() {
        setCopied(true);
        setCopyError(false);
        schedule();
    }

    function triggerCopyError() {
        setCopyError(true);
        setCopied(false);
        schedule();
    }

    return { copied, copyError, fading, triggerCopied, triggerCopyError };
}
