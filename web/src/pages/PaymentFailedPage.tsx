import {
    FiArrowLeft,
    FiHome,
    FiMail,
    FiRefreshCw,
    FiShield,
    FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

export default function PaymentFailedPage() {
    const navigate = useNavigate();

    return (
        <PageContainer
            title="Payment Failed"
            description="Unfortunately, we couldn't complete your payment."
        >
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
                    {/* Hero */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-brand-rose to-accent px-8 py-14 text-primary-foreground">
                        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/5" />

                        <div className="relative flex flex-col items-center text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                                <FiXCircle
                                    size={58}
                                    className="text-red-500"
                                />
                            </div>

                            <h1 className="mt-8 text-4xl font-black">
                                Payment Unsuccessful
                            </h1>

                            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
                                We couldn't process your payment this time.
                                Don't worry — no tickets have been issued and
                                you can safely try again.
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-8 p-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-background p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <FiRefreshCw
                                        className="text-primary"
                                        size={22}
                                    />
                                </div>

                                <h3 className="font-bold">
                                    Try Again
                                </h3>

                                <p className="mt-2 text-sm text-muted">
                                    Go to my orders and try paying again. If you changed your mind you can always cancel your order as well.
                                    quickly.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                                    <FiShield
                                        className="text-accent"
                                        size={22}
                                    />
                                </div>

                                <h3 className="font-bold">
                                    No Charges Made
                                </h3>

                                <p className="mt-2 text-sm text-muted">
                                    If your payment failed, your order wasn't
                                    completed and no tickets were generated.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                                    <FiMail
                                        className="text-accent"
                                        size={22}
                                    />
                                </div>

                                <h3 className="font-bold">
                                    Need Help?
                                </h3>

                                <p className="mt-2 text-sm text-muted">
                                    If the problem continues, please contact our
                                    support team and we'll be happy to help.
                                </p>
                            </div>
                        </div>

                        {/* Advice */}

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
                            <h2 className="text-lg font-bold text-red-600">
                                What should you do next?
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <FiArrowLeft className="text-red-500" />
                                    <span>
                                        Return to the event page and create a
                                        new order.
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FiArrowLeft className="text-red-500" />
                                    <span>
                                        Double-check your payment details before
                                        trying again.
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <FiArrowLeft className="text-red-500" />
                                    <span>
                                        If the issue persists, contact your bank
                                        or our support team.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                            <Button
                                className="flex-1"
                                onClick={() => navigate("/events")}
                            >
                                <FiRefreshCw className="mr-2" />
                                Create New Order
                            </Button>

                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate("/my-orders")}
                            >
                                <FiArrowLeft className="mr-2" />
                                View My Orders
                            </Button>

                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate("/")}
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