
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="relative flex flex-1 items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                <section className="mx-auto flex max-w-5xl flex-col items-center text-center">
                    <div className="mb-8 inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-black uppercase tracking-widest text-primary shadow-sm">
                        404 · Page not found
                    </div>

                    <div className="relative mb-8 flex h-36 w-36 items-center justify-center rounded-[2rem] border border-border bg-surface shadow-2xl shadow-brand-black/10">
                        <div className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <FiSearch size={26} />
                        </div>
                        <span className="text-6xl font-black text-primary">404</span>
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        This page slipped out of the ticket queue.
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                        The page you are looking for does not exist, may have been moved, or is not part of the current TicketFlow portfolio version.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/')}>
                            <FiHome className="mr-2" />
                            Back to Home
                        </Button>

                        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
                            <FiArrowLeft className="mr-2" />
                            Go Back
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}