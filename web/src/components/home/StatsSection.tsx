const stats = [
    { label: 'Events created', value: '2.4K+' },
    { label: 'Tickets issued', value: '180K+' },
    { label: 'Payment success rate', value: '98%' },
    { label: 'Average check-in time', value: '4s' },
];

export function StatsSection() {
    return (
        <section className="bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                            <p className="text-4xl font-black text-brand-yellow">{stat.value}</p>
                            <p className="mt-2 text-sm font-semibold text-white/70">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
