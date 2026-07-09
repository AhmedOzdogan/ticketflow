

type LoadingProps = {
    message?: string;
    overlay?: boolean;
    className?: string;
};

export function Loading({
    message = 'Loading...',
    overlay = false,
    className = '',
}: LoadingProps) {
    const wrapperClassName = overlay
        ? `absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-background/70 backdrop-blur-sm ${className}`
        : `flex items-center justify-center py-12 ${className}`;

    return (
        <div className={wrapperClassName}>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-8 py-6 shadow-xl shadow-brand-black/10">
                <span className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-bold text-muted">{message}</p>
            </div>
        </div>
    );
}