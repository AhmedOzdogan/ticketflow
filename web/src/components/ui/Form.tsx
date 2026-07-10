import type { ChangeEvent, ReactNode } from 'react';

export type FieldValue = string | number | boolean;

export type FormField<TValues extends object = Record<string, FieldValue>> = {
    name: Extract<keyof TValues, string>;
    label: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'datetime-local' | 'checkbox' | 'textarea' | 'select';
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    rows?: number;
    icon?: ReactNode;
    rightIcon?: ReactNode;
    onRightIconClick?: () => void;
    helperText?: string;
    containerClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    options?: { label: string; value: string }[];
};

type FormFieldsProps<TValues extends object> = {
    fields: FormField<TValues>[];
    values: TValues;
    onChange: (name: Extract<keyof TValues, string>, value: FieldValue) => void;
    className?: string;
    disabled?: boolean;
};

export function FormFields<TValues extends object>({
    fields,
    values,
    onChange,
    disabled = false,
    className = 'space-y-5',
}: FormFieldsProps<TValues>) {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        const nextValue =
            event.target.type === 'number'
                ? event.target.value === ''
                    ? ''
                    : Number(event.target.value)
                : value;

        onChange(name as Extract<keyof TValues, string>, nextValue);
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        onChange(name as Extract<keyof TValues, string>, checked);
    };

    return (
        <div className={className}>
            {fields.map((field) => {
                const fieldType = field.type ?? 'text';
                const fieldValue = values[field.name as keyof TValues];

                if (fieldType === 'checkbox') {
                    return (
                        <label
                            key={field.name}
                            className={`flex items-start gap-3 text-sm font-semibold leading-6 text-muted ${field.containerClassName ?? ''} ${field.labelClassName ?? ''}`}
                        >
                            <input
                                name={field.name}
                                type="checkbox"
                                checked={Boolean(fieldValue)}
                                onChange={handleCheckboxChange}
                                required={field.required}
                                disabled={disabled}
                                className="mt-1 size-4 accent-primary"
                            />
                            <span>{field.label}</span>
                        </label>
                    );
                }

                if (fieldType === 'select') {
                    return (
                        <label key={field.name} className={`block ${field.containerClassName ?? ''} ${field.labelClassName ?? ''}`}>
                            <span className="text-sm font-bold text-foreground">{field.label}</span>
                            <select
                                name={field.name}
                                value={String(fieldValue ?? '')}
                                onChange={handleInputChange}
                                required={field.required}
                                disabled={disabled}
                                className={`mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary ${field.inputClassName ?? ''}`}
                            >
                                <option value="" disabled>
                                    {field.placeholder ?? 'Select an option'}
                                </option>
                                {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {field.helperText && <p className="mt-2 text-xs font-semibold text-muted">{field.helperText}</p>}
                        </label>
                    );
                }

                if (fieldType === 'textarea') {
                    return (
                        <label key={field.name} className={`block ${field.containerClassName ?? ''} ${field.labelClassName ?? ''}`}>
                            <span className="text-sm font-bold text-foreground">{field.label}</span>
                            <textarea
                                name={field.name}
                                rows={field.rows ?? 4}
                                value={String(fieldValue ?? '')}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                disabled={disabled}
                                className={`mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary ${field.inputClassName ?? ''}`}
                            />
                            {field.helperText && <p className="mt-2 text-xs font-semibold text-muted">{field.helperText}</p>}
                        </label>
                    );
                }

                return (
                    <label key={field.name} className={`block ${field.containerClassName ?? ''} ${field.labelClassName ?? ''}`}>
                        <span className="text-sm font-bold text-foreground">{field.label}</span>
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                            {field.icon && <span className="size-5 text-muted">{field.icon}</span>}
                            <input
                                name={field.name}
                                type={fieldType}
                                value={String(fieldValue ?? '')}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                autoComplete={field.autoComplete}
                                required={field.required}
                                disabled={disabled}
                                className={`w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground ${field.inputClassName ?? ''}`}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                            {field.rightIcon && (
                                <button
                                    type="button"
                                    onClick={field.onRightIconClick}
                                    className="text-muted-foreground transition hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {field.rightIcon}
                                </button>
                            )}
                        </div>
                        {field.helperText && <p className="mt-2 text-xs font-semibold text-muted">{field.helperText}</p>}
                    </label>
                );
            })}
        </div>
    );
}