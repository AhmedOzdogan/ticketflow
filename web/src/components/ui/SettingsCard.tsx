interface SettingsCardProps {
    children: React.ReactNode;
}

export function SettingsCard({ children }: SettingsCardProps) {
    return (
        <section className="flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8">
            {children}
        </section>
    );
}