import type { ReactNode } from "react";

type PageDashboardProps = {
    title?: string;
    description?: string;
    children: ReactNode;
    filters?: ReactNode;
};

export default function PageDashboard({
    title,
    description,
    children,
    filters,
}: PageDashboardProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6 mb-8">
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <h2 className="text-2xl font-bold">{title}</h2>
                    )}

                    {description && (
                        <p className="mt-1 text-muted">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {children}
            </div>

            {filters && (
                <div className="mt-5">
                    {filters}
                </div>
            )}
        </div>
    );
}