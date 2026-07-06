import { FiArrowRight } from 'react-icons/fi';
import { Button } from '../ui/Button';

export function CtaSection() {
    return (
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-primary shadow-2xl shadow-primary/20">
                <div className="grid items-center gap-10 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12 lg:p-16">
                    <div>
                        <p className="text-sm font-black uppercase tracking-wide text-primary-foreground/80">
                            Ready for your next event?
                        </p>
                        <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-primary-foreground sm:text-5xl">
                            Create an event page, sell tickets, and manage check-ins with confidence.
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80">
                            Start with a clean organizer workflow and expand later with Stripe webhooks, QR tickets,
                            dashboards, and automated tests.
                        </p>

                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <Button variant="secondary" size="lg">
                                Start building
                                <FiArrowRight className="size-5" />
                            </Button>
                            <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:border-white hover:text-white">
                                View roadmap
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 p-3">
                        <img
                            src="/images/music_concert.webp"
                            alt="Audience enjoying a music event"
                            className="h-80 w-full rounded-[1.2rem] object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
