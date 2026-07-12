import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type Theme = 'light' | 'dark';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    disabled?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25',
    secondary:
        'bg-secondary text-secondary-foreground shadow-sm shadow-secondary/20 hover:bg-secondary/90 hover:shadow-md hover:shadow-secondary/25',
    outline:
        'border border-border bg-surface text-foreground shadow-sm hover:border-primary hover:text-primary',
    ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-3 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-3 text-base',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    type = 'button',
    disabled = false,
    ...props
}: ButtonProps) {
    const buttonClasses = `inline-flex items-center justify-center gap-2 rounded-full font-bold disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    return (
        <button type={type} className={buttonClasses} {...props} disabled={disabled}>
            {children}
        </button>
    );
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';

        const savedTheme = window.localStorage.getItem('ticketflow-theme') as Theme | null;

        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme;
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('ticketflow-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="size-15 p-0 sm:h-11 sm:w-auto sm:px-4 sm:py-2"
        >
            <span className="relative flex size-6 items-center justify-center sm:size-4">
                {theme === 'dark' ? (
                    <FiSun className="size-6 transition duration-200 sm:size-4" />
                ) : (
                    <FiMoon className="size-6 transition duration-200 sm:size-4" />
                )}
            </span>
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </Button>
    );
}