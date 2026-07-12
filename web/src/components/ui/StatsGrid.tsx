import type { IconType } from 'react-icons';

type StatItem = {
    title: string;
    value: number | string;
    icon?: IconType;
    color?: string;
};

type StatsGridProps = {
    items: StatItem[];
    columns?: 2 | 3 | 4 | 5 | 6 | 7;
};

export default function StatsGrid({ items, columns = 4 }: StatsGridProps) {

    const columnClasses = {

        2: "md:grid-cols-2",

        3: "lg:grid-cols-3",

        4: "xl:grid-cols-4",

        5: "xl:grid-cols-5",

        6: "xl:grid-cols-6",

        7: "xl:grid-cols-7",

    };
    return (
        <div
            className={`mb-10 grid grid-cols-1 gap-5 ${columnClasses[columns]}`}
        >
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.title}
                        className="rounded-2xl border bg-white p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {item.title}
                            </p>

                            {Icon && (
                                <Icon
                                    className={item.color ?? "text-primary"}
                                    size={20}
                                />
                            )}
                        </div>

                        <p
                            className={`mt-3 text-4xl font-bold ${item.color ?? ""
                                }`}
                        >
                            {item.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}