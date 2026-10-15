import { useId, type InputHTMLAttributes } from 'react';
import { fieldClass, labelClass } from './field';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className={labelClass}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                {...props}
                className={[fieldClass, error ? 'border-film-danger' : '', className]
                    .filter(Boolean)
                    .join(' ')}
            />
            {error && <span className="text-film-danger text-xs font-mono">{error}</span>}
        </div>
    );
}
