import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiCheckCircle,
    FiCalendar,
    FiMapPin,
    FiUsers,
    FiTag,
    FiShoppingCart,
    FiInfo,
    FiArrowRight,
} from 'react-icons/fi';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';

import type { EventDetail } from '../types/events';
import { getEventDetails } from '../api/eventApi';

type InfoCardProps = {
    title: string;
    children?: React.ReactNode;
};

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <h4 className="mb-3 text-sm font-semibold text-muted">{title}</h4>

        <div className="flex items-start gap-3">
            {title === 'Date & Time' && <FiCalendar className="mt-1 text-primary" />}
            {title === 'Venue' && <FiMapPin className="mt-1 text-primary" />}
            {title === 'Organizer' && <FiUsers className="mt-1 text-primary" />}
            {title === 'Address' && <FiMapPin className="mt-1 text-primary" />}

            <div>{children}</div>
        </div>
    </div>
);

const FeaturesList = () => {
    const features = [
        'Secure Stripe Checkout',
        'Instant Digital Ticket',
        'QR Code Entry',
        'Mobile Friendly',
    ];
    return (
        <div className="rounded-2xl border border-border bg-background p-4">
            <ul className="space-y-3 text-muted">
                {features.map((feature) => (
                    <li key={feature} className="flex items-center">
                        <FiCheckCircle className="text-primary mr-2" />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const EventDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const updateQuantity = (ticketId: string, delta: number, max: number) => {
        setQuantities((prev) => {
            const current = prev[ticketId] ?? 0;
            const next = Math.max(0, Math.min(max, current + delta));
            return { ...prev, [ticketId]: next };
        });
    };

    const { totalTickets, totalPrice } = useMemo(() => {
        const totalTickets = event
            ? event.ticket_types.reduce((sum, t) => sum + (quantities[t.id] ?? 0), 0)
            : 0;

        const totalPrice = event
            ? event.ticket_types.reduce(
                (sum, t) => sum + (quantities[t.id] ?? 0) * Number(t.price),
                0,
            )
            : 0;

        return { totalTickets, totalPrice };
    }, [event, quantities]);

    React.useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        let mounted = true;

        async function loadEvent() {
            setLoading(true);

            try {
                const [data] = await Promise.all([
                    getEventDetails(slug as string),
                    new Promise((resolve) => setTimeout(resolve, 1000)),
                ]);

                if (mounted) {
                    setEvent(data);
                }
            } catch (error) {
                console.error('Failed to load event', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadEvent();

        return () => {
            mounted = false;
        };
    }, [slug]);

    if (loading) {
        return (
            <>
                <Header />
                <Loading />
                <Footer />
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Header />
                <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">
                    <div className="rounded-[2rem] border border-border bg-surface p-10 text-center shadow-xl shadow-brand-black/10">
                        <h2 className="text-3xl font-black text-foreground">Event not found</h2>
                        <p className="mt-3 text-muted">The event you're looking for doesn't exist or is no longer available.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            {/* Hero Section */}
            <section
                className="relative h-[50vh] min-h-[420px] sm:h-[60vh] lg:h-[50vh] lg:min-h-[500px] w-full overflow-hidden"
            >
                <img
                    src={event.cover_image ?? '/placeholder-event.webp'}
                    alt={event.title}
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-8 sm:bottom-12 lg:bottom-20 z-10 mx-auto max-w-[80] px-6 lg:px-8">
                    <div className="max-w-5xl text-white">
                        <span className="inline-block bg-primary text-background font-semibold rounded-full mb-4 px-2 py-1 text-[10px] sm:px-3 sm:text-sm">
                            {event.category.toUpperCase()}
                        </span>
                        <h1 className="font-black leading-tight text-3xl sm:text-4xl lg:text-7xl">{event.title}</h1>
                        <p className="mt-6 max-w-2xl text-sm sm:text-base lg:text-lg leading-8 text-white/90">{event.description}</p>
                        <div className="mt-4 mb-4 flex flex-wrap items-center gap-6 text-sm md:text-base text-white/90">
                            <div className="flex items-center gap-2">
                                <FiCalendar className="text-primary" />
                                <span>
                                    {new Date(event.start_date).toLocaleString(undefined, {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FiMapPin className="text-primary" />
                                <span>{event.venue_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Info Panel */}
            <section className="relative z-20 mx-auto mt-0  sm:px-0 max-w-full lg   :max-w-[80vw] py-5">
                <div className="space-y-8 border m-0 bg-surface p-4 sm:p-10 shadow-xl shadow-brand-black/10">
                    <div className="space-y-10">

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoCard title="Date & Time">
                                {new Date(event.start_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </InfoCard>
                            <InfoCard title="Venue">{event.venue_name}</InfoCard>
                            <InfoCard title="Organizer">{event.organizer_name}</InfoCard>
                            <InfoCard title="Address">{event.address}</InfoCard>
                        </div>
                    </div>

                    <div className="grid gap-0 rounded-[2rem] border border-border bg-background p-4 sm:p-6 lg:p-8 lg:grid-rows">
                        {/* LEFT COLUMN */}
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black text-foreground">Choose your ticket</h2>
                            <p className="mt-2 text-muted">Select the ticket that best suits you.</p>
                            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
                                {event.ticket_types.map((ticket) => {
                                    // Badge color for remaining
                                    const isLow = ticket.remaining_quantity <= 50;
                                    let badgeClass =
                                        isLow
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700";
                                    // Label badge for ticket type
                                    let typeBadge = null;
                                    if (ticket.name === "Regular") {
                                        typeBadge = (
                                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary align-middle">
                                                Most Popular
                                            </span>
                                        );
                                    } else if (ticket.name === "VIP") {
                                        typeBadge = (
                                            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 align-middle">
                                                Premium
                                            </span>
                                        );
                                    } else if (ticket.name === "Early Bird") {
                                        typeBadge = (
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 align-middle">
                                                Best Value
                                            </span>
                                        );
                                    }
                                    return (
                                        <div
                                            key={ticket.id}
                                            className="flex flex-col gap-4 p-4 sm:p-5 transition-colors hover:bg-background/60 md:flex-row md:items-center"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FiTag className="text-primary" />
                                                    <h3 className="text-lg sm:text-xl font-black">{ticket.name}</h3>
                                                    {typeBadge}
                                                </div>
                                                <p className="text-sm text-muted">{ticket.description}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>
                                                        <FiInfo className="mr-1 inline" />
                                                        Remaining: {ticket.remaining_quantity}
                                                    </span>
                                                </div>
                                                <span className="mt-3 block text-xl sm:text-2xl font-black text-primary md:hidden">
                                                    €{ticket.price}
                                                </span>
                                            </div>
                                            {/* Price under description for mobile, on right for desktop */}
                                            <div className="ml-auto flex items-center gap-6">
                                                <span className="hidden text-2xl lg:text-3xl font-black text-primary md:block">
                                                    €{ticket.price}
                                                </span>
                                                <div className="flex items-center overflow-hidden rounded-xl border border-border bg-background">
                                                    <button
                                                        type="button"
                                                        className="flex h-10 w-10 items-center justify-center text-lg font-bold transition hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => updateQuantity(ticket.id, -1, ticket.remaining_quantity)}
                                                        disabled={(quantities[ticket.id] ?? 0) === 0}
                                                    >
                                                        −
                                                    </button>

                                                    <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-bold">
                                                        {quantities[ticket.id] ?? 0}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="flex h-10 w-10 items-center justify-center text-lg font-bold transition hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => updateQuantity(ticket.id, 1, ticket.remaining_quantity)}
                                                        disabled={(quantities[ticket.id] ?? 0) === ticket.remaining_quantity}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* RIGHT SIDEBAR */}
                        <div className="self-start rounded-2xl border border-border bg-surface p-4 mt-10 sm:mt-3 sm:p-6 lg:sticky lg:top-28">
                            <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-foreground">
                                <FiShoppingCart className="text-primary" />
                                <span>Ticket Summary</span>
                            </h3>
                            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected Tickets</p>
                                <p className="mt-1 text-lg font-semibold text-foreground">{totalTickets} ticket{totalTickets !== 1 ? 's' : ''}</p>
                                <p className="mt-3 text-3xl lg:text-4xl font-black text-primary">€{totalPrice.toFixed(2)}</p>
                            </div>
                            <hr className="my-4 border-border" />
                            <FeaturesList />
                            <hr className="my-4 border-border" />
                            <div className="mb-4 rounded-lg border border-border bg-background p-4 text-sm text-muted">
                                <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                                    <FiInfo className="mt-0.5 text-primary" />
                                    Need help?
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/feature-preview')}
                                    className="mt-1 text-sm font-semibold text-primary transition hover:underline"
                                >
                                    Contact our support team.
                                </button>
                            </div>
                            <Button className="flex w-full items-center justify-center gap-2 py-3 text-base font-semibold">
                                Proceed to Checkout
                                <FiArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default EventDetailPage;