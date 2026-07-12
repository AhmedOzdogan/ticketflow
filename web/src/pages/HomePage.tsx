import { CtaSection } from '../components/home/CtaSection';
import { FeaturedEvents } from '../components/home/FeaturedEvents';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorks } from '../components/home/HowItWorks';
import { StatsSection } from '../components/home/StatsSection';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { useState, useEffect } from 'react';
import type { PublicEventListPaginatedResponse, EventListPublicItem } from '../types/events';
import { getEvents } from '../api/eventApi';
import { toast } from "sonner";

function HomePage() {
    const [events, setEvents] = useState<EventListPublicItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        async function loadEvents() {
            try {
                const data: PublicEventListPaginatedResponse = await getEvents({
                    ordering: "-created_at",
                });

                setEvents(data.results);
            } catch (error) {
                toast.error("There was a problem while loading. Please refresh the page")
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                <HeroSection featuredEvent={events[0]} loading={loading} />
                <FeaturedEvents events={events} loading={loading} />
                <HowItWorks />
                <StatsSection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;
