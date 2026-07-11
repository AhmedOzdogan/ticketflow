import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import type { EventListPublicItem } from '../../types/events';
import { EventCard } from '../ui/EventCard';

type FeaturedEventsProps = {
    events: EventListPublicItem[];
    loading: boolean;
};

export function FeaturedEvents({ events, loading }: FeaturedEventsProps) {
    const navigate = useNavigate();


    return (
        <section className="bg-surface px-4 py-20 sm:px-6 lg:px-8" id="events">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-primary">Featured events</p>
                        <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                            Discover events people want to attend.
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                            Showcase upcoming concerts, festivals, conferences, and theater events with a clean ticketing flow.
                        </p>
                    </div>

                    <Button variant="outline" onClick={() => navigate('/events')}>
                        View all events
                    </Button>
                </div>

                {loading && (
                    <p className="mt-12 text-center text-muted">Loading events...</p>
                )}

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {events.slice(0, 4).map((event) => (
                        <EventCard key={event.slug} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
}
