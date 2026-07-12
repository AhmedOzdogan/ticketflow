import { FiSearch } from 'react-icons/fi';

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
}: SearchInputProps) {
    return (
        <div className={`relative w-full xl:max-w-md ${className}`}>
            <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
            />

            <input
                type="search"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
        </div>
    );
}