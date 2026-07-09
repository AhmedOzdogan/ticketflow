import { FiCalendar, FiMapPin } from 'react-icons/fi';
import type { EventListItem } from '../../types/events';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

type EventCardProps = {
    event: EventListItem;
    variant?: 'default' | 'hero';
    layout?: 'compact' | 'horizontal';
};

export function EventCard({ event, variant = 'default', layout = 'compact' }: EventCardProps) {
    const navigate = useNavigate();

    const goToEventDetails = () => {
        navigate(`/events/${event.slug}`);
    };
    const eventDate = new Date(event.start_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const heroStats = [
        { label: 'Tickets sold', value: '12.8K' },
        { label: 'Revenue', value: '€84K' },
        { label: 'Check-ins', value: '9.6K' },
    ];

    if (variant === 'hero') {
        return (
            <article className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl shadow-brand-black/10">
                <img
                    src={event.cover_image ?? '/placeholder-event.webp'}
                    alt={event.title}
                    className="h-72 w-full object-cover sm:h-80"
                />

                <div className="space-y-6 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-primary">Newest Event</p>
                            <h2 className="mt-1 text-2xl font-black text-foreground">{event.title}</h2>
                            <p className="mt-2 text-sm text-muted">{eventDate} • {event.venue_name}</p>
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
                                    <span key={index} className={index % 2 === 0 ? 'rounded-sm bg-white' : 'rounded-sm bg-brand-yellow'} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    if (layout === 'horizontal') {
        const badges = ['Selling Fast', 'Popular', 'Limited Seats'];
        const badge = badges[event.title.length % badges.length];
        function toTitleCase(str: string) {
            return str.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        }
        return (
            <article className="group overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10 lg:grid lg:grid-cols-[220px_1fr]">
                {/* Left side */}
                <div className="relative h-52 lg:h-full">
                    <img
                        src={event.cover_image ?? '/placeholder-event.webp'}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-6 top-6 rounded-full bg-primary px-4 py-1 text-base font-black text-primary-foreground">
                        {toTitleCase(event.category)}
                    </span>
                    <span className="absolute bottom-6 left-6 rounded-full bg-brand-yellow px-4 py-1 text-base font-black text-brand-black">
                        {badge}
                    </span>
                </div>
                {/* Right side */}
                <div className="flex h-full flex-col p-6 lg:p-8">
                    <h3 className="text-2xl font-black leading-tight text-foreground line-clamp-2">{event.title}</h3>
                    <p className="mt-4 text-base leading-7 text-muted line-clamp-3">
                        Discover this event on TicketFlow. Book your tickets online and enjoy a fast, secure check-in experience.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-base font-semibold text-muted">
                            <FiCalendar className="size-7 text-accent" />
                            {eventDate}
                        </div>
                        <div className="flex items-center gap-2 text-base font-semibold text-muted">
                            <FiMapPin className="size-7 text-accent" />
                            {event.city}, {event.country}
                        </div>
                        <div className="flex items-center gap-2 text-base font-semibold text-muted">
                            Digital tickets and organizer check-in included
                        </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                        <div>
                            <div className="text-sm font-semibold text-muted">From</div>
                            <div className="text-4xl font-black text-foreground">€{event.ticket_types[0].price}</div>
                        </div>
                        <div className="flex shrink-0 gap-3">
                            <Button variant="secondary" onClick={goToEventDetails}>Details</Button>
                            <Button onClick={goToEventDetails}>Get ticket</Button>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article
            className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={event.cover_image ?? '/placeholder-event.webp'}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                    {event.category.toUpperCase()}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="min-h-[3.5rem] line-clamp-2 text-xl font-black leading-7 text-foreground">
                    {event.title}
                </h3>

                <div className="mt-4 min-h-[3.5rem] space-y-2 text-sm font-medium text-muted">
                    <p className="flex items-center gap-2">
                        <FiCalendar className="size-4 shrink-0 text-accent" />
                        {eventDate}
                    </p>
                    <p className="flex items-center gap-2">
                        <FiMapPin className="size-4 shrink-0 text-accent" />
                        {event.city}, {event.country}
                    </p>
                </div>

                <div className="mt-auto border-t border-border pt-5 flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-black text-foreground">
                        {event.organizer_name}
                    </p>
                    <Button variant="secondary" size="sm" onClick={goToEventDetails}>
                        Details
                    </Button>
                </div>
            </div>
        </article>
    );
}

export default EventCard;