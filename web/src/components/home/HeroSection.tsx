import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../ui/Button';
import type { EventListPublicItem } from '../../types/events';
import { EventCard } from '../ui/EventCard';


type HeroSectionProps = {
    featuredEvent?: EventListPublicItem;
    loading: boolean;
};

export function HeroSection({ featuredEvent, loading }: HeroSectionProps) {

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

                    {loading ? (
                        <div className="flex h-[650px] items-center justify-center rounded-[2rem] border border-border bg-surface shadow-2xl shadow-brand-black/10">
                            <p className="text-sm font-semibold text-muted">Loading newest event...</p>
                        </div>
                    ) : featuredEvent ? (
                        <EventCard event={featuredEvent} variant="hero" />
                    ) : (
                        <div className="flex h-[650px] items-center justify-center rounded-[2rem] border border-dashed border-border bg-surface">
                            <p className="text-sm font-semibold text-muted">No featured event available.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
