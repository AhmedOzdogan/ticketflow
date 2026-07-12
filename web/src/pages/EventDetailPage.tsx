import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiCheckCircle,
    FiCalendar,
    FiMapPin,
    FiUsers,
    FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { getApiErrorMessage } from '../utils/getApiErrorMessages';
import type { EventListPublicItem, EventListItem } from '../types/events';
import {
    getEventDetails,
    getManageEventDetails,
    editEvent
} from "../api/eventApi";

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

const EventDetailPage = () => {
    const { slug, id } = useParams();
    const isPreview = Boolean(id);
    const navigate = useNavigate();
    const [event, setEvent] =
        useState<EventListItem | EventListPublicItem | null>(null);

    const [loading, setLoading] = useState(true);

    const handleRequestPublish = async () => {
        if (!id) return;

        try {
            const formData = new FormData();
            formData.append("status", "pending");

            await editEvent(id, formData);

            toast.success("Your event has been submitted for review.");

            navigate("/organizer/events");
        } catch (error) {
            toast.error(getApiErrorMessage(error));
        }
    };
    useEffect(() => {
        if (!slug && !id) {
            setLoading(false);
            return;
        }

        let mounted = true;

        async function loadEvent() {
            setLoading(true);

            try {
                const [data] = await Promise.all([
                    id
                        ? getManageEventDetails(id)
                        : getEventDetails(slug!),
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
    }, [slug, id]);

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

    const previewEvent = isPreview

        ? (event as EventListItem)

        : null;

    return (
        <>
            <Header />
            {isPreview && previewEvent && (
                <>
                    {previewEvent.status === "draft" && (
                        <section className="border-b border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
                            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                                        Organizer Preview
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Your event is currently in preview mode.
                                    </h2>

                                    <p className="mt-3 text-base leading-7 text-slate-700">
                                        This is how your event will appear to visitors after
                                        it has been approved. Once you click
                                        <span className="font-semibold">
                                            {" "}Request Publication
                                        </span>
                                        , our administrators will review your event and make
                                        any necessary improvements before publication.
                                    </p>

                                    <p className="mt-3 text-sm font-medium text-amber-800">
                                        After submitting your request, you will no longer be
                                        able to edit this event while it is under review.
                                    </p>
                                </div>

                                <div className="flex shrink-0">
                                    <Button
                                        size="lg"
                                        className="px-8"
                                        onClick={handleRequestPublish}
                                    >
                                        Request Publication
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {previewEvent.status === "pending" && (
                        <section className="border-b border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                                        Under Review
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Your event is being reviewed.
                                    </h2>

                                    <p className="mt-3 text-base leading-7 text-slate-700">
                                        Your publication request has been sent successfully.
                                        Our administrators are currently reviewing the event
                                        details and checking that everything is ready for
                                        publication.
                                    </p>

                                    <p className="mt-3 text-sm font-medium text-blue-800">
                                        You cannot edit this event while it is under review.
                                        Please wait for our administrators to complete the
                                        approval process.
                                    </p>
                                </div>

                                <div className="shrink-0 rounded-xl border border-blue-200 bg-white/70 px-6 py-4 text-sm text-blue-800">
                                    <p className="font-semibold">
                                        Review in progress
                                    </p>

                                    <p className="mt-1">
                                        No action is required from you.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {previewEvent.status === "published" && (
                        <section className="border-b border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="mb-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-800">
                                        Published
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Your event is live.
                                    </h2>

                                    <p className="mt-3 text-base text-slate-700">
                                        Your event has been approved and is now visible to
                                        visitors.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {previewEvent.status === "cancelled" && (
                        <section className="border-b border-red-300 bg-gradient-to-r from-red-50 to-rose-50">
                            <div className="mx-auto max-w-7xl px-6 py-8">
                                <div className="mb-3 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-800">
                                    Cancelled
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900">
                                    This event has been cancelled.
                                </h2>

                                <p className="mt-3 text-base text-slate-700">
                                    The event is no longer available to visitors.
                                </p>
                            </div>
                        </section>
                    )}

                    {previewEvent.status === "completed" && (
                        <section className="border-b border-slate-300 bg-gradient-to-r from-slate-50 to-gray-100">
                            <div className="mx-auto max-w-7xl px-6 py-8">
                                <div className="mb-3 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Completed
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900">
                                    This event has been completed.
                                </h2>

                                <p className="mt-3 text-base text-slate-700">
                                    The event has finished and is no longer accepting new
                                    bookings.
                                </p>
                            </div>
                        </section>
                    )}
                </>
            )}
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

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        {event.ticket_types.map((ticket) => {
                            const isVip = ticket.name === "VIP";
                            const isRegular = ticket.name === "Regular";
                            const isEarlyBird = ticket.name === "Early Bird";
                            const isSoldOut = ticket.remaining_quantity === 0;
                            const isLowStock =
                                ticket.remaining_quantity > 0 &&
                                ticket.remaining_quantity <= 20;

                            const cardStyle = isVip
                                ? "border-secondary bg-gradient-to-br from-secondary/35 via-surface to-surface"
                                : isRegular
                                    ? "border-primary/40 bg-gradient-to-br from-primary/10 via-surface to-surface"
                                    : isEarlyBird
                                        ? "border-accent/40 bg-gradient-to-br from-accent/15 via-surface to-surface"
                                        : "border-border bg-surface";

                            const badge = isVip
                                ? "Premium"
                                : isRegular
                                    ? "Most Popular"
                                    : isEarlyBird
                                        ? "Best Value"
                                        : "Ticket";

                            const badgeStyle = isVip
                                ? "bg-secondary text-secondary-foreground"
                                : isRegular
                                    ? "bg-primary text-primary-foreground"
                                    : isEarlyBird
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-surface-muted text-foreground";

                            return (
                                <div
                                    key={ticket.id ?? ticket.name}
                                    className={`group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border p-6 shadow-sm transition-all duration-300 sm:p-8 ${isSoldOut
                                        ? "cursor-not-allowed opacity-60"
                                        : "hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-black/10"
                                        } ${cardStyle}`}
                                >
                                    {isRegular && (
                                        <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyle}`}
                                        >
                                            {badge}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${isSoldOut
                                                ? "bg-muted/15 text-muted"
                                                : isLowStock
                                                    ? "bg-danger/10 text-danger"
                                                    : "bg-success/10 text-success"
                                                }`}
                                        >
                                            {isSoldOut
                                                ? "Sold out"
                                                : isLowStock
                                                    ? `Only ${ticket.remaining_quantity} left`
                                                    : `${ticket.remaining_quantity} available`}
                                        </span>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-3xl font-black text-foreground">
                                            {ticket.name}
                                        </h3>

                                        <p className="mt-3 min-h-[72px] text-sm leading-6 text-muted sm:text-base">
                                            {ticket.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 rounded-2xl border border-border bg-surface/80 p-5">
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black text-primary sm:text-5xl">
                                                €{ticket.price}
                                            </span>

                                            <span className="pb-1 text-sm font-medium text-muted">
                                                per ticket
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs font-medium text-muted">
                                            Price includes 18% VAT
                                        </p>
                                    </div>

                                    <div className="my-7 h-px bg-border" />

                                    <ul className="space-y-3 text-sm text-muted">
                                        <li className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                                                <FiCheckCircle className="text-success" />
                                            </span>
                                            Digital QR ticket
                                        </li>

                                        <li className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                                                <FiCheckCircle className="text-success" />
                                            </span>
                                            Instant confirmation
                                        </li>

                                        <li className="flex items-center gap-3">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                                                <FiCheckCircle className="text-success" />
                                            </span>
                                            Secure Stripe checkout
                                        </li>
                                    </ul>

                                    <div className="mt-auto pt-8">
                                        <Button
                                            className={`flex w-full items-center justify-center gap-2 ${isVip
                                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                                : isRegular
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                                                }`}
                                            disabled={isPreview || isSoldOut}
                                            onClick={() =>
                                                navigate(`/checkout/${slug}`, {
                                                    state: {
                                                        selectedTicketId: ticket.id,
                                                    },
                                                })
                                            }
                                        >
                                            {isSoldOut
                                                ? "Sold Out"
                                                : isPreview
                                                    ? "Preview Only"
                                                    : `Buy ${ticket.name}`}

                                            {!isSoldOut && !isPreview && (
                                                <FiArrowRight size={18} />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default EventDetailPage;