interface AdminTopbarProps {
    title: string;
    subtitle?: string;
    adminEmail?: string;
}

export default function AdminTopbar({ title, subtitle, adminEmail }: AdminTopbarProps) {
    return (
        <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>

                {adminEmail && (
                    <span className=" px-3 py-1 text-md font-medium text-black">
                        {adminEmail}
                    </span>
                )}
            </div>
        </header>
    );
}
