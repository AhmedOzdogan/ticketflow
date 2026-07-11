import { useState, useEffect } from "react";
import { getMyEvents } from "../api/eventApi";
import type { EventListItem } from "../types/events";
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

function MyEvents() {
    const [events, setEvents] = useState<EventListItem[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        async function loadMyEvents() {
            try {
                setIsLoading(true);

                const data = await getMyEvents({
                    page,
                    pageSize: 10,
                    ordering: "-created_at",
                });

                setEvents(data.results);
                setCount(data.count);
            } catch (error) {
                toast.error(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        loadMyEvents();
    }, [page]);
    return (
        <>
            <Header />

            <PageHeader
                title="My Events"
                description="Manage your events and keep them up to date."
            />

            <main className="mx-auto max-w-7xl px-4 py-10">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <p>Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-xl border bg-white p-12 text-center">
                        <h2 className="text-xl font-semibold">No events yet</h2>
                        <p className="mt-2 text-muted-foreground">
                            Create your first event to start selling tickets.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                My Events ({count})
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <img
                                            src={event.cover_image ?? "https://placehold.co/600x400?text=No+Image"}
                                            alt={event.title}
                                            className="h-56 w-full object-cover md:h-auto md:w-72"
                                        />

                                        <div className="flex flex-1 flex-col justify-between p-6">
                                            <div>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                                                        {event.category}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-bold">
                                                    {event.title}
                                                </h3>

                                                <p className="mt-3 text-muted-foreground">
                                                    {event.venue_name},{" "}
                                                    {event.city},{" "}
                                                    {event.country}
                                                </p>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {new Date(
                                                        event.start_date,
                                                    ).toLocaleString()}
                                                </p>

                                                {event.ticket_types.length > 0 && (
                                                    <div className="mt-6">
                                                        <h4 className="mb-2 text-sm font-semibold">
                                                            Ticket Types
                                                        </h4>

                                                        <div className="space-y-2">
                                                            {event.ticket_types.map(
                                                                (ticket) => (
                                                                    <div
                                                                        key={
                                                                            ticket.id
                                                                        }
                                                                        className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                ticket.name
                                                                            }
                                                                        </span>

                                                                        <span className="font-semibold">
                                                                            €
                                                                            {
                                                                                ticket.price
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => navigate(`/organizer/edit-event/${event.id}`)}
                                                >
                                                    Edit Event
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </>
    );

}

export default MyEvents