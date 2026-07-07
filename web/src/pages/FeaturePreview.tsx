

import { FiArrowLeft, FiCode, FiLayers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

type FeaturePreviewProps = {
    title?: string;
    description?: string;
};

export default function FeaturePreview({
    title = 'Coming Soon',
    description = 'This page is intentionally not included in the portfolio version of TicketFlow.',
}: FeaturePreviewProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
                    <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 p-10 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                            <FiLayers size={34} />
                        </div>

                        <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                            Portfolio Edition
                        </span>

                        <h1 className="mt-5 text-4xl font-black">{title}</h1>
                        <p className="mx-auto mt-4 max-w-xl text-muted">
                            {description}
                        </p>
                    </div>

                    <div className="space-y-6 p-10">
                        <div className="rounded-2xl border border-border bg-background p-6">
                            <div className="mb-3 flex items-center gap-3 text-primary">
                                <FiCode />
                                <h2 className="font-bold">Why isn't this page available?</h2>
                            </div>

                            <p className="text-sm leading-7 text-muted">
                                TicketFlow is a portfolio project focused on demonstrating production-quality software architecture rather than implementing every possible feature. Priority was given to authentication, role-based authorization, event management, payments, ticket generation, and responsive UI.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button onClick={() => navigate(-1)}>
                                <FiArrowLeft className="mr-2" />
                                Go Back
                            </Button>

                            <Button variant="outline" onClick={() => navigate('/')}>
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}