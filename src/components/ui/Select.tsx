import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function Select({
    label,
    error,
    options,
    placeholder,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-xs font-mono text-film-muted uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                {...props}
                className={[
                    'bg-film-bg border border-film-border rounded-lg px-3 py-2.5',
                    'text-film-text font-mono text-sm',
                    'focus:outline-none focus:border-film-accent transition-colors',
                    'appearance-none',
                    error ? 'border-film-danger' : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {placeholder && (
                    <option value="">
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-film-danger text-xs font-mono">{error}</span>}
        </div>
    );
}
