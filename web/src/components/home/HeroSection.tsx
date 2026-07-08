import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../ui/Button';

const heroStats = [
    { label: 'Tickets sold', value: '12.8K' },
    { label: 'Revenue', value: '€84K' },
    { label: 'Check-ins', value: '9.6K' },
];

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pt-4 lg:pb-14">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_28%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_26%)] opacity-20" />

            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-sm">
                        <span className="size-2 rounded-full bg-accent" />
                        Event management made simple
                    </div>

                    <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        Sell tickets, manage guests, and check in attendees faster.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                        TicketFlow helps organizers create events, sell tickets, issue digital tickets,
                        and manage attendee check-ins from one clean dashboard.
                    </p>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <Button size="lg">
                            Create event
                            <FiArrowRight className="size-5" />
                        </Button>
                        <Button variant="outline" size="lg">
                            Explore events
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-muted sm:flex-row sm:items-center sm:gap-6">
                        <span className="inline-flex items-center gap-2">
                            <FiCheckCircle className="size-4 text-success" /> Stripe-ready checkout
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FiCheckCircle className="size-4 text-success" /> QR-style tickets
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <FiCheckCircle className="size-4 text-success" /> Organizer dashboard
                        </span>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -left-6 -top-6 size-24 rounded-full bg-secondary/40 blur-2xl" />
                    <div className="absolute -bottom-8 -right-8 size-32 rounded-full bg-primary/30 blur-2xl" />

                    <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl shadow-brand-black/10">
                        <img
                            src="/images/concert.webp"
                            alt="Concert crowd at a live event"
                            className="h-72 w-full object-cover sm:h-80"
                        />

                        <div className="space-y-6 p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide text-primary">Live event</p>
                                    <h2 className="mt-1 text-2xl font-black text-foreground">Munich Sound Night</h2>
                                    <p className="mt-2 text-sm text-muted">Sat, Apr 18 · Zenith München</p>
                                </div>
                                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
                                    Selling fast
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {heroStats.map((stat) => (
                                    <div key={stat.label} className="rounded-2xl border border-border bg-surface-muted p-4">
                                        <p className="text-lg font-black text-foreground">{stat.value}</p>
                                        <p className="mt-1 text-xs font-semibold text-muted">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">VIP Ticket</p>
                                        <p className="text-xs text-muted">Digital entry pass generated after payment</p>
                                    </div>
                                    <div className="grid size-14 grid-cols-3 gap-1 rounded-xl bg-brand-black p-2">
                                        {Array.from({ length: 9 }).map((_, index) => (
                                            <span
                                                key={index}
                                                className={`rounded-sm ${index % 2 === 0 ? 'bg-white' : 'bg-brand-yellow'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
