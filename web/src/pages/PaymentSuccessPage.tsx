import {
    FiArrowRight,
    FiCheckCircle,
    FiHome,
    FiMail,
    FiMap,
} from "react-icons/fi";
import { TfiTicket } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import PageContainer from "../components/layout/PageContainer";

export default function PaymentSuccessPage() {
    const navigate = useNavigate();

    return (
        <PageContainer
            title="Payment Successful"
            description="Your order has been confirmed."
        >
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-brand-rose to-accent px-8 py-14 text-primary-foreground">
                        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />
                        <div className="relative flex flex-col items-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                                <FiCheckCircle
                                    size={58}
                                    className="text-success"
                                />
                            </div>
                            <h1 className="mt-8 text-4xl font-black">
                                Congratulations!
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
                                Your payment has been completed successfully.
                                Your tickets have been generated and are ready
                                to use.
                            </p>
                        </div>
                    </div>
                    {/* Body */}
                    <div className="space-y-8 p-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <TfiTicket
                                        className="text-primary"
                                        size={22}
                                    />
                                </div>
                                <h3 className="font-bold">
                                    Tickets Ready
                                </h3>
                                <p className="mt-2 text-sm text-muted">
                                    Your QR tickets have been created and are
                                    available immediately.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-background p-6">

                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                                    <FiMail
                                        className="text-accent"
                                        size={22}
                                    />
                                </div>
                                <h3 className="font-bold">
                                    Confirmation Email
                                </h3>
                                <p className="mt-2 text-sm text-muted">
                                    A confirmation email will arrive in your
                                    inbox shortly.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                                    <FiMap
                                        className="text-accent"
                                        size={22}
                                    />
                                </div>
                                <h3 className="font-bold">
                                    Ready for the Event
                                </h3>
                                <p className="mt-2 text-sm text-muted">
                                    Simply present your QR ticket at the venue
                                    entrance.
                                </p>
                            </div>
                        </div>
                        {/* Summary */}
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                            <h2 className="text-lg font-bold text-primary">
                                What happens next?
                            </h2>
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiCheckCircle className="text-success" />
                                    <span>
                                        Your payment has been confirmed.
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiCheckCircle className="text-success" />
                                    <span>
                                        Your tickets are available in My Tickets.
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FiCheckCircle className="text-success" />
                                    <span>
                                        You're all set for an amazing event!
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                            <Button
                                className="flex-1"
                                onClick={() =>
                                    navigate("/my-orders")
                                }
                            >
                                <TfiTicket className="mr-2" />
                                View My Orders
                            </Button>
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() =>
                                    navigate("/events")
                                }
                            >
                                <FiArrowRight className="mr-2" />
                                Browse More Events
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                <FiHome className="mr-2" />
                                Home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}