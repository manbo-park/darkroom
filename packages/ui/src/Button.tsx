import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    fullWidth?: boolean;
}

const variantClasses = {
    primary: 'accent-gradient-border text-film-text font-semibold active:scale-95',
    secondary:
        'bg-film-surface text-film-text border border-film-border hover:border-film-muted active:scale-95',
    danger: 'bg-film-danger/20 text-film-danger border border-film-danger/40 hover:bg-film-danger/30 active:scale-95',
    ghost: 'text-film-muted hover:text-film-text active:scale-95',
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-4 text-base',
};

export function Button({
    variant = 'secondary',
    size = 'md',
    children,
    fullWidth,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={[
                'rounded-lg font-mono tracking-wide transition-all duration-150',
                variantClasses[variant],
                sizeClasses[size],
                fullWidth ? 'w-full' : '',
                disabled ? 'opacity-40 pointer-events-none' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </button>
    );
}
