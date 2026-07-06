import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

function HomePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">
                {/* Main content of the home page */}
                <section className="bg-background py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-bold text-foreground">Welcome to TicketFlow</h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Your one-stop solution for managing events, tickets, and check-ins.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;
