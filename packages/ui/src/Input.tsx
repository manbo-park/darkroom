import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-mono text-film-muted uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                {...props}
                className={[
                    'bg-film-bg border border-film-border rounded-lg px-3 py-2.5',
                    'text-film-text font-mono text-sm placeholder-film-muted',
                    'focus:outline-none focus:border-film-accent transition-colors',
                    error ? 'border-film-danger' : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            />
            {error && <span className="text-film-danger text-xs font-mono">{error}</span>}
        </div>
    );
}
