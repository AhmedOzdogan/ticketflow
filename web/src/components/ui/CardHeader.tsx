import type { IconType } from 'react-icons';
import { FiUser } from 'react-icons/fi';

interface CardHeaderProps {
    icon?: IconType;
    title: string;
    description: string;
    iconClassName?: string;
}

export function CardHeader({
    icon: Icon = FiUser,
    title,
    description,
    iconClassName = 'bg-primary/10 text-primary',
}: CardHeaderProps) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <div
                className={`flex size-11 items-center justify-center rounded-2xl ${iconClassName}`}
            >
                <Icon />
            </div>

            <div>
                <h2 className="text-xl font-black text-foreground">
                    {title}
                </h2>
                <p className="text-sm font-semibold text-muted">
                    {description}
                </p>
            </div>
        </div>
    );
}