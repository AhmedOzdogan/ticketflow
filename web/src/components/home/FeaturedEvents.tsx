import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { Button } from '../ui/Button';
import featuredEvents from '../../data/featuredEvents';

export function FeaturedEvents() {
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

                    <Button variant="outline">View all events</Button>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredEvents.map((event) => (
                        <article
                            key={event.title}
                            className="group overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                                    {event.category}
                                </span>
                            </div>

                            <div className="p-5">
                                <h3 className="text-xl font-black text-foreground">{event.title}</h3>

                                <div className="mt-4 space-y-2 text-sm font-medium text-muted">
                                    <p className="flex items-center gap-2">
                                        <FiCalendar className="size-4 text-accent" />
                                        {event.date}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FiMapPin className="size-4 text-accent" />
                                        {event.location}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-4">
                                    <p className="text-base font-black text-foreground">{event.price}</p>
                                    <Button variant="ghost" size="sm">
                                        Details
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
