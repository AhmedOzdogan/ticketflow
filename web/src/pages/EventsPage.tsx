import { FiCalendar, FiMapPin, FiSearch, FiSliders, FiUsers } from 'react-icons/fi';
import featuredEvents from '../data/featuredEvents';
import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

const categories = ['All', 'Music', 'Festival', 'Theater', 'Conference'];

function Events() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main>
                {/* Page hero */}
                <section className="relative overflow-hidden bg-background px-4 pt-6 pb-8 sm:px-6 lg:px-8 lg:pt-4 lg:pb-14">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted shadow-sm">
                                    <span className="size-2 rounded-full bg-accent" />
                                    Browse events
                                </div>

                                <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">
                                    Find events, choose tickets, and reserve your spot.
                                </h1>

                                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                                    Explore concerts, festivals, conferences, and theater events. TicketFlow keeps the discovery,
                                    checkout, and check-in experience clean from start to finish.
                                </p>

                                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                    <Button size="lg">Explore events</Button>
                                    <Button variant="outline" size="lg">Create an event</Button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-2xl shadow-brand-black/10">
                                <img
                                    src="/images/music_concert.webp"
                                    alt="Crowd enjoying a music festival"
                                    className="h-80 w-full rounded-[1.5rem] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search and filters */}
                <section className="border-y border-border bg-surface px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-xl">
                            <FiSearch className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
                            <input
                                type="search"
                                placeholder="Search by event name, city, or category"
                                className="w-full rounded-full border border-border bg-background py-3 pl-12 pr-4 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === 'All'
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                        : 'border border-border bg-background text-muted hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}

                            <Button variant="outline" size="sm">
                                <FiSliders className="size-4" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Event cards */}
                <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-wide text-primary">Upcoming events</p>
                                <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Popular events this season</h2>
                            </div>

                            <p className="text-sm font-semibold text-muted">Showing {featuredEvents.length} events</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {featuredEvents.map((event) => (
                                <article
                                    key={event.id}
                                    className="group grid overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10 lg:grid-cols-[0.9fr_1.1fr]"
                                >
                                    <div className="relative min-h-72 overflow-hidden">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                                            {event.category}
                                        </span>
                                        <span className="absolute bottom-4 left-4 rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
                                            {event.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-col p-6">
                                        <h3 className="text-2xl font-black text-foreground">{event.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-muted">{event.description}</p>

                                        <div className="mt-5 space-y-3 text-sm font-semibold text-muted">
                                            <p className="flex items-center gap-2">
                                                <FiCalendar className="size-4 text-accent" />
                                                {event.date}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FiMapPin className="size-4 text-accent" />
                                                {event.location}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <FiUsers className="size-4 text-accent" />
                                                Digital tickets and organizer check-in included
                                            </p>
                                        </div>

                                        <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xl font-black text-foreground">{event.price}</p>
                                            <div className="flex gap-3">
                                                <Button variant="outline" size="sm">Details</Button>
                                                <Button size="sm">Get ticket</Button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Organizer CTA */}
                <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-brand-black p-8 text-white shadow-2xl shadow-brand-black/20 md:p-12">
                        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                            <div>
                                <p className="text-sm font-black uppercase tracking-wide text-brand-yellow">For organizers</p>
                                <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight">
                                    Want to publish your own event?
                                </h2>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                                    Create event pages, add ticket types, track sales, and manage attendee check-ins from one dashboard.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                                <Button variant="secondary" size="lg">Create event</Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white/30 bg-white/10 text-white hover:border-white hover:text-white"
                                >
                                    Learn more
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Events;
