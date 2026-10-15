import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboboxFieldProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    error?: string;
    className?: string;
}

export function ComboboxField({
    value,
    onChange,
    options,
    placeholder,
    error,
    className = '',
}: ComboboxFieldProps) {
    const [open, setOpen] = useState(false);
    const [inputVal, setInputVal] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // 외부 value가 바뀌면 렌더 중 즉시 입력값을 동기화한다.
    if (value !== prevValue) {
        setPrevValue(value);
        setInputVal(value);
    }

    useEffect(() => {
        function handlePointerDown(e: PointerEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const filtered = options;

    const commit = (val: string) => {
        setInputVal(val);
        onChange(val);
        setOpen(false);
    };

    const handleBlur = () => {
        setTimeout(() => {
            onChange(inputVal);
            setOpen(false);
        }, 100);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                className={`flex items-center bg-film-bg border rounded-lg overflow-hidden transition-colors ${
                    error
                        ? 'border-film-danger'
                        : 'border-film-border focus-within:border-film-accent'
                }`}
            >
                <input
                    type="text"
                    value={inputVal}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2.5 font-mono text-sm text-film-text placeholder-film-muted outline-none bg-transparent min-w-0"
                    onChange={(e) => {
                        setInputVal(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onChange(inputVal);
                            setOpen(false);
                            e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                            setOpen(false);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="shrink-0 px-3 text-film-muted hover:text-film-text transition-colors"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setOpen((o) => !o);
                    }}
                >
                    <ChevronDown size={14} />
                </button>
            </div>
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-film-surface border border-film-border rounded-lg shadow-lg max-h-48 overflow-y-auto font-mono text-sm">
                    {filtered.map((opt) => (
                        <li
                            key={opt}
                            className={`px-3 py-1.5 cursor-pointer hover:bg-film-border ${
                                opt === value
                                    ? 'text-film-accent bg-film-accent/10'
                                    : 'text-film-text'
                            }`}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                commit(opt);
                            }}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
