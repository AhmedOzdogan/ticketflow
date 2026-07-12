import type { IconType } from 'react-icons';

type FilterOption = {
    label: string;
    value: string;
    icon?: IconType;
};

type FilterChipsProps = {
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    trailing?: React.ReactNode;
};

export default function FilterChips({
    value,
    options,
    onChange,
    trailing,
}: FilterChipsProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 xl:justify-start">
            {options.map((option) => {
                const Icon = option.icon;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${value === option.value
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted hover:border-primary hover:text-primary'
                            }`}
                    >
                        {Icon && <Icon size={16} />}
                        {option.label}
                    </button>
                );
            })}

            {trailing}
        </div>
    );
}