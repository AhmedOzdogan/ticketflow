import type { ChangeEvent, ReactNode } from 'react';

export type FieldValue = string | boolean;

export type FormField<TValues extends object = Record<string, FieldValue>> = {
    name: Extract<keyof TValues, string>;
    label: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'checkbox' | 'textarea';
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    rows?: number;
    icon?: ReactNode;
    rightIcon?: ReactNode;
    onRightIconClick?: () => void;
    helperText?: string;
    containerClassName?: string;
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
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        onChange(name as Extract<keyof TValues, string>, value);
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
                            className={`flex items-start gap-3 text-sm font-semibold leading-6 text-muted ${field.containerClassName ?? ''}`}
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

                if (fieldType === 'textarea') {
                    return (
                        <label key={field.name} className={`block ${field.containerClassName ?? ''}`}>
                            <span className="text-sm font-bold text-foreground">{field.label}</span>
                            <textarea
                                name={field.name}
                                rows={field.rows ?? 4}
                                value={String(fieldValue ?? '')}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                disabled={disabled}
                                className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                            />
                            {field.helperText && <p className="mt-2 text-xs font-semibold text-muted">{field.helperText}</p>}
                        </label>
                    );
                }

                return (
                    <label key={field.name} className={`block ${field.containerClassName ?? ''}`}>
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
                                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
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