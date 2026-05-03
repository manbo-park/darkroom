import { useState, useRef, useEffect } from 'react';

interface ComboboxFieldProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    error?: string;
    className?: string;
}

export function ComboboxField({ value, onChange, options, placeholder, error, className = '' }: ComboboxFieldProps) {
    const [open, setOpen] = useState(false);
    const [inputVal, setInputVal] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputVal(value);
    }, [value]);

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
                className={`flex items-center border rounded-md overflow-hidden focus-within:ring-1 ${
                    error
                        ? 'border-red-400 focus-within:ring-red-400'
                        : 'border-gray-200 focus-within:ring-blue-400 focus-within:border-blue-400'
                }`}
            >
                <input
                    type="text"
                    value={inputVal}
                    placeholder={placeholder}
                    className="flex-1 px-2.5 py-1.5 text-sm outline-none bg-transparent min-w-0"
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
                    className="shrink-0 px-2 py-1.5 text-gray-400 hover:text-gray-600"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setOpen((o) => !o);
                    }}
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 11L2 5h12L8 11z" />
                    </svg>
                </button>
            </div>
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto text-sm">
                    {filtered.map((opt) => (
                        <li
                            key={opt}
                            className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 ${
                                opt === value ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'
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
