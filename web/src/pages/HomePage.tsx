import { CtaSection } from '../components/home/CtaSection';
import { FeaturedEvents } from '../components/home/FeaturedEvents';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorks } from '../components/home/HowItWorks';
import { StatsSection } from '../components/home/StatsSection';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                <HeroSection />
                <FeaturedEvents />
                <HowItWorks />
                <StatsSection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;
