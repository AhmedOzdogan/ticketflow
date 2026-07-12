import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EventListPublicItem } from '../types/events';
import {
    FiCalendar,
    FiMapPin,
    FiShoppingCart,
    FiShield,
    FiCreditCard,
    FiMinus,
    FiPlus,
    FiArrowLeft,
    FiLock,
} from 'react-icons/fi';
import { getEventDetails } from '../api/eventApi';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import AuthGate from './AuthGate';
import { toast } from "sonner";
import { createOrder } from '../api/orderApi';


const CheckoutPage = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] =
        useState<EventListPublicItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        let mounted = true;

        async function loadEvent() {
            setLoading(true);

            try {
                const [data] = await Promise.all([
                    getEventDetails(slug!),
                    new Promise((resolve) => setTimeout(resolve, 1000)),
                ]);

                if (mounted) {
                    setEvent(data);

                    const initial: Record<string, number> = {};
                    data.ticket_types.forEach(ticket => {
                        if (ticket.id) {
                            initial[ticket.id] = 0;
                        }
                    });

                    setQuantities(initial);
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

    const updateQuantity = (
        ticketId: string,
        delta: number,
        max: number,
    ) => {
        setQuantities((prev) => {
            const current = prev[ticketId] ?? 0;

            const next = Math.max(
                0,
                Math.min(max, current + delta),
            );

            return {
                ...prev,
                [ticketId]: next,
            };
        });
    };

    const subtotal = useMemo(() => {
        if (!event) return 0;

        return event.ticket_types.reduce(
            (sum, ticket) =>
                sum +
                (quantities[ticket.id!] ?? 0) *
                Number(ticket.price),
            0,
        );
    }, [event, quantities]);

    const totalTickets = useMemo(() => {
        return Object.values(quantities).reduce(
            (sum, quantity) => sum + quantity,
            0,
        );
    }, [event, quantities]);

    const total = subtotal;
    const tax = Number((total! * 18 / 118).toFixed(2));
    const subtotalExcludingTax = Number((total! - tax).toFixed(2));

    const handlePayment = async () => {
        if (event && !event.id) {
            toast.error('Event ID is missing.');
            return;
        }

        const items = Object.entries(quantities)
            .filter(([, quantity]) => quantity > 0)
            .map(([ticketTypeId, quantity]) => ({
                ticket_type: ticketTypeId,
                quantity,
            }));

        if (items.length === 0) {
            toast.error('Please select at least one ticket.');
            return;
        }

        try {
            setIsCreatingOrder(true);

            const order = await createOrder({
                event: event!.id!,
                items,
            });

            const response = await fetch(
                'http://localhost:5001/payment/create-checkout-session',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        order_id: order.id,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to create Stripe checkout session.');
            }

            const checkout = await response.json();

            window.location.href = checkout.checkout_url;
        } catch (error) {
            console.error('Failed to create order:', error);
            toast.error('Could not create your order. Please try again.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen" />
                <Footer />
            </>
        );

    }

    if (!user) {
        return (
            <AuthGate />
        );
    }

    if (!event) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    Event not found.
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="min-h-screen bg-background">
                <section className="border-b border-border bg-surface">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline"
                        >
                            <FiArrowLeft />

                            Back to Event
                        </button>

                        <h1 className="text-4xl font-black text-foreground">
                            Checkout
                        </h1>

                        <p className="mt-2 text-muted">
                            Review your tickets before
                            proceeding to secure payment.
                        </p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
                    {/* LEFT COLUMN */}
                    <div className="space-y-8">

                        {/* Event Card */}
                        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                            <img
                                src={event.cover_image || undefined}
                                alt={event.title}
                                className="h-64 w-full object-cover"
                            />

                            <div className="p-6">
                                <h2 className="text-3xl font-black text-foreground">
                                    {event.title}
                                </h2>

                                <div className="mt-5 flex flex-wrap gap-6 text-sm text-muted">
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-primary" />
                                        <span>
                                            {event.start_date}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="text-primary" />
                                        <span>
                                            {event.venue_name}, {event.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6">
                            {event.ticket_types.map((ticket) => {
                                const isVip = ticket.name === 'VIP';
                                const isRegular = ticket.name === 'Regular';
                                const isEarlyBird = ticket.name === 'Early Bird';

                                const isSoldOut = ticket.remaining_quantity === 0;
                                const isLowStock =
                                    ticket.remaining_quantity > 0 &&
                                    ticket.remaining_quantity <= 20;

                                const cardStyle = isVip
                                    ? 'border-secondary bg-gradient-to-br from-secondary/30 via-surface to-surface'
                                    : isRegular
                                        ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface'
                                        : isEarlyBird
                                            ? "border-accent/40 bg-gradient-to-br from-accent/15 via-surface to-surface"
                                            : "border-border bg-surface";

                                const badge = isVip
                                    ? 'Premium'
                                    : isRegular
                                        ? 'Most Popular'
                                        : isEarlyBird
                                            ? "Best Value"
                                            : "Ticket";

                                const badgeStyle = isVip
                                    ? 'bg-secondary text-secondary-foreground'
                                    : isRegular
                                        ? 'bg-primary text-primary-foreground'
                                        : isEarlyBird
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-surface-muted text-foreground";

                                return (
                                    <div
                                        key={ticket.id}
                                        className={`rounded-[var(--radius-xl)] border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${cardStyle}`}
                                    >
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyle}`}
                                                    >
                                                        {badge}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isSoldOut
                                                            ? 'bg-muted/20 text-muted'
                                                            : isLowStock
                                                                ? 'bg-danger/10 text-danger'
                                                                : 'bg-success/10 text-success'
                                                            }`}
                                                    >
                                                        {isSoldOut
                                                            ? 'Sold Out'
                                                            : `${ticket.remaining_quantity} left`}
                                                    </span>
                                                </div>
                                                <h3 className="mt-5 text-3xl font-black">
                                                    {ticket.name}
                                                </h3>
                                                <p className="mt-3 max-w-xl text-muted">
                                                    {ticket.description}
                                                </p>
                                                <div className="mt-6 flex items-end gap-2">
                                                    <span className="text-5xl font-black text-primary">
                                                        €{ticket.price}
                                                    </span>

                                                    <span className="pb-1 text-sm text-muted">
                                                        includes VAT
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                ticket.id!,
                                                                -1,
                                                                ticket.remaining_quantity,
                                                            )
                                                        }
                                                        disabled={
                                                            isSoldOut ||
                                                            (quantities[ticket.id!] ?? 0) === 0
                                                        }
                                                        className="flex h-12 w-12 items-center justify-center transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <FiMinus />
                                                    </button>
                                                    <div className="flex h-12 w-16 items-center justify-center border-x border-border text-lg font-black">
                                                        {quantities[ticket.id!] ?? 0}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                ticket.id!,
                                                                1,
                                                                ticket.remaining_quantity,
                                                            )
                                                        }
                                                        disabled={
                                                            isSoldOut ||
                                                            (quantities[ticket.id!] ?? 0) >=
                                                            ticket.remaining_quantity
                                                        }
                                                        className="flex h-12 w-12 items-center justify-center transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-semibold text-muted">
                                                    Selected: {quantities[ticket.id!] ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Buyer Information */}
                        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">

                            <h2 className="text-3xl font-black text-foreground">
                                Buyer Information
                            </h2>

                            <p className="mt-2 text-muted">
                                Your tickets will be sent to this email address.
                            </p>

                            <div className="mt-8 grid gap-6">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Email
                                    </label>

                                    <input
                                        value={user?.email ?? ""}
                                        readOnly
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3"
                                    />

                                </div>
                            </div>

                        </div>

                    </div>
                    {/* RIGHT COLUMN */}
                    <aside className="lg:sticky lg:top-28 self-start">

                        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">

                            <div className="flex items-center gap-3">
                                <FiShoppingCart className="text-2xl text-primary" />

                                <h2 className="text-2xl font-black text-foreground">
                                    Order Summary
                                </h2>
                            </div>

                            <div className="mt-8 space-y-5">

                                {event?.ticket_types
                                    .filter((ticket) => (quantities[ticket.id!] ?? 0) > 0)
                                    .map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div>

                                                <p className="font-semibold">
                                                    {ticket.name}
                                                </p>

                                                <p className="text-sm text-muted">
                                                    {quantities[ticket.id!]} × €{ticket.price}
                                                </p>

                                            </div>

                                            <p className="font-bold">
                                                €
                                                {(
                                                    (quantities[ticket.id!] ?? 0) *
                                                    Number(ticket.price)
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}

                            </div>

                            <hr className="my-8 border-border" />

                            <div className="space-y-4 text-sm">

                                <div className="flex items-center justify-between">

                                    <span className="text-muted">
                                        Tickets
                                    </span>

                                    <span className="font-semibold">
                                        {totalTickets}
                                    </span>

                                </div>

                                <div className="flex items-center justify-between">

                                    <span className="text-muted">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold">
                                        €{subtotalExcludingTax.toFixed(2)}
                                    </span>

                                </div>

                                <div className="flex items-center justify-between">

                                    <span className="text-muted">
                                        Tax <span className='font-bold'>(Already Included)</span>
                                    </span>

                                    <span className="font-semibold">
                                        €{tax}
                                    </span>

                                </div>

                                <div className="flex items-center justify-between">

                                    <span className="text-muted">
                                        Service Fee
                                    </span>

                                    <span className="font-semibold">
                                        €0
                                    </span>

                                </div>

                            </div>

                            <hr className="my-8 border-border" />

                            <div className="flex items-center justify-between">

                                <span className="text-2xl font-black">
                                    Total
                                </span>

                                <span className="text-4xl font-black text-primary">
                                    €{total.toFixed(2)}
                                </span>

                            </div>

                            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

                                <div className="flex items-center gap-3">

                                    <FiShield className="text-xl text-green-600" />

                                    <div>

                                        <p className="font-semibold text-green-700">
                                            Secure Checkout
                                        </p>

                                        <p className="text-sm text-green-600">
                                            Payments are securely processed
                                            using Stripe.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="mt-6 rounded-2xl border border-border bg-background p-5">

                                <div className="flex items-center gap-3">

                                    <FiLock className="text-primary" />

                                    <span className="text-sm text-muted">
                                        SSL encrypted payment
                                    </span>

                                </div>

                                <div className="mt-4 flex items-center gap-3">

                                    <FiCreditCard className="text-primary" />

                                    <span className="text-sm text-muted">
                                        Visa • Mastercard • Apple Pay • Google Pay
                                    </span>

                                </div>

                            </div>

                            <Button
                                size="lg"
                                className="mt-8 w-full"
                                disabled={totalTickets === 0 || isCreatingOrder}
                                onClick={() => handlePayment()}
                            >
                                {isCreatingOrder ? 'Creating Order...' : 'Buy the tickets now!'}
                            </Button>

                            <p className="mt-4 text-center text-xs text-muted">
                                You won't be charged until you complete the
                                payment securely on Stripe.
                            </p>

                        </div>

                    </aside>

                </section>

            </main>

            <Footer />

        </>
    );
};

export default CheckoutPage;