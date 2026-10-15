import { useId, type SelectHTMLAttributes } from 'react';
import { fieldClass, labelClass } from './field';

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
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={selectId} className={labelClass}>
                    {label}
                </label>
            )}
            <select
                id={selectId}
                {...props}
                className={[
                    fieldClass,
                    'appearance-none',
                    error ? 'border-film-danger' : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {placeholder && <option value="">{placeholder}</option>}
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
