import { FiCreditCard, FiEdit3, FiUserCheck } from 'react-icons/fi';

const steps = [
    {
        title: 'Create your event',
        description: 'Add event details, ticket types, capacity, location, and publish your event page in minutes.',
        icon: FiEdit3,
    },
    {
        title: 'Sell tickets online',
        description: 'Customers choose ticket types and complete a secure checkout flow powered by Stripe.',
        icon: FiCreditCard,
    },
    {
        title: 'Check in attendees',
        description: 'Validate ticket codes at the entrance and prevent duplicate check-ins from the organizer dashboard.',
        icon: FiUserCheck,
    },
];

export function HowItWorks() {
    return (
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-black uppercase tracking-wide text-primary">How it works</p>
                    <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        From event idea to checked-in guests.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-muted">
                        TicketFlow keeps the full event lifecycle simple: publish, sell, and manage entry from one place.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <article
                                key={step.title}
                                className="rounded-[1.75rem] border border-border bg-surface p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10"
                            >
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                                    <Icon className="size-6" />
                                </div>

                                <p className="mt-8 text-sm font-black text-primary">Step {index + 1}</p>
                                <h3 className="mt-2 text-2xl font-black text-foreground">{step.title}</h3>
                                <p className="mt-4 text-sm leading-6 text-muted">{step.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
