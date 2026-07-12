import { FiChevronDown } from 'react-icons/fi';

type Option = {
    label: string;
    value: string;
};

type AppSelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    className?: string;
};

export default function AppSelect({
    value,
    onChange,
    options,
    className = '',
}: AppSelectProps) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="h-12 min-w-44 appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <FiChevronDown
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                size={16}
            />
        </div>
    );
}