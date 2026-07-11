interface AdminTopbarProps {
    title: string;
    subtitle?: string;
    adminEmail?: string;
}

export default function AdminTopbar({ title, subtitle, adminEmail }: AdminTopbarProps) {
    return (
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>

                {adminEmail && (
                    <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-black">
                        {adminEmail}
                    </span>
                )}
            </div>
        </header>
    );
}
