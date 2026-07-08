

import { FaApple, FaFacebookF, FaGoogle } from 'react-icons/fa';
import { Button } from './Button';

const providers = [
    {
        id: 'google',
        label: 'Continue with Google',
        icon: FaGoogle,
        className:
            'border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10 dark:text-primary',
    },
    {
        id: 'apple',
        label: 'Continue with Apple',
        icon: FaApple,
        className:
            'bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200',
    },
    {
        id: 'facebook',
        label: 'Continue with Facebook',
        icon: FaFacebookF,
        className:
            'bg-[#1877F2] text-white hover:bg-[#166FE5]',
    },
];

interface LoginButtonsProps {
    onProviderClick?: (provider: 'google' | 'apple' | 'facebook') => void;
}

export function LoginButtons({ onProviderClick }: LoginButtonsProps) {
    return (
        <div className="flex flex-col gap-3">
            {providers.map(({ id, label, icon: Icon, className }) => (
                <Button
                    key={id}
                    type="button"
                    variant="ghost"
                    className={`h-12 w-full justify-center gap-3 rounded-xl font-medium transition-all duration-200 ${className}`}
                    onClick={() => onProviderClick?.(id as 'google' | 'apple' | 'facebook')}
                >
                    <Icon className="size-5 shrink-0" />
                    <span>{label}</span>
                </Button>
            ))}
        </div>
    );
}