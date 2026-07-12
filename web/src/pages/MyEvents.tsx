import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getMyEvents } from "../api/eventApi";
import type { EventListItem } from "../types/events";
import { getApiErrorMessage } from "../utils/getApiErrorMessages";
import { Button } from "../components/ui/Button";
import PageContainer from "../components/layout/PageContainer";

import { useAuth } from "../context/AuthContext";
import AuthGate from "./AuthGate";

import {
    FiCalendar,
    FiEye,
    FiCheckCircle,
    FiClock,
    FiEdit,
    FiFileText,
    FiMapPin,
    FiPlus,
    FiSearch,
    FiTag,
    FiXCircle,
} from "react-icons/fi";
import { Loading } from "../components/ui/Loading";

const PAGE_SIZE = 10;

function MyEvents() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventListItem[]>([]);
    const [count, setCount] = useState(0);

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [ordering, setOrdering] = useState("-created_at");
    const [statusFilter, setStatusFilter] = useState("all");

    const [isLoading, setIsLoading] = useState(true);

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    useEffect(() => {
        async function loadEvents() {
            try {
                setIsLoading(true);

                const data = await getMyEvents({
                    page,
                    pageSize: PAGE_SIZE,
                    search: search || undefined,
                    ordering,
                });
                await new Promise((resolve) => setTimeout(resolve, 500));
                setEvents(data.results);
                setCount(data.count);
            } catch (error) {
                setEvents([]);
                setCount(0);
                toast.error(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        void loadEvents();
    }, [page, search, ordering]);

    const visibleEvents = useMemo(() => {
        if (statusFilter === "all") {
            return events;
        }

        return events.filter(
            (event) => event.status.toLowerCase() === statusFilter,
        );
    }, [events, statusFilter]);

    const publishedCount = useMemo(
        () => events.filter((event) => event.status === "published").length,
        [events],
    );

    const draftCount = useMemo(
        () => events.filter((event) => event.status === "draft").length,
        [events],
    );

    const rejectedCount = useMemo(
        () =>
            events.filter(
                (event) =>
                    event.status === "rejected" ||
                    event.status === "cancelled",
            ).length,
        [events],
    );

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function getStatusBadge(status: string) {
        switch (status.toLowerCase()) {
            case "published":
            case "approved":
                return {
                    icon: <FiCheckCircle />,
                    className:
                        "border-green-200 bg-green-100 text-green-700",
                };

            case "draft":
            case "pending":
                return {
                    icon: <FiClock />,
                    className:
                        "border-yellow-200 bg-yellow-100 text-yellow-700",
                };

            case "rejected":
            case "cancelled":
                return {
                    icon: <FiXCircle />,
                    className:
                        "border-red-200 bg-red-100 text-red-700",
                };

            default:
                return {
                    icon: <FiFileText />,
                    className:
                        "border-blue-200 bg-blue-100 text-blue-700",
                };
        }
    }

    if (!user) {
        return <AuthGate />;
    }

    if (user.role !== "admin" && user.role !== "organizer") {
        return <AuthGate variant="unauthorized" />;
    }

    return (
        <>
            <PageContainer
                title="My Events"
                description="Manage, monitor and update your events.">

                <main className="mx-auto w-full max-w-7xl pb-10 sm:px-0">
                    <div className="mb-8 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="shrink-0">
                                <h2 className="text-3xl font-bold">
                                    Event Dashboard
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    View and manage all of your events.
                                </p>
                            </div>

                            <div className="grid w-full gap-3 md:grid-cols-2 lg:max-w-4xl lg:grid-cols-[minmax(240px,1fr)_190px_210px_auto]">
                                <form
                                    onSubmit={handleSearch}
                                    className="relative"
                                >
                                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                    <input
                                        value={searchInput}
                                        onChange={(event) =>
                                            setSearchInput(event.target.value)
                                        }
                                        placeholder="Search events..."
                                        className="h-11 w-full rounded-xl border bg-white pl-10 pr-24 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />

                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary"
                                    >
                                        Search
                                    </button>
                                </form>

                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setPage(1);
                                        setStatusFilter(event.target.value);
                                    }}
                                    className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="published">Published</option>
                                    <option value="pending">Pending</option>
                                    <option value="draft">Draft</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <select
                                    value={ordering}
                                    onChange={(event) => {
                                        setPage(1);
                                        setOrdering(event.target.value);
                                    }}
                                    className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    <option value="-created_at">Newest First</option>
                                    <option value="created_at">Oldest First</option>
                                    <option value="start_date">Start Date</option>
                                    <option value="-start_date">
                                        Latest Start Date
                                    </option>
                                    <option value="title">Title A-Z</option>
                                    <option value="-title">Title Z-A</option>
                                </select>

                                <Button
                                    className="h-11 w-full whitespace-nowrap px-5 md:col-span-2 xl:col-span-1 xl:w-auto"
                                    onClick={() =>
                                        navigate("/organizer/create-event/")
                                    }
                                >
                                    <FiPlus className="mr-2 shrink-0" />
                                    Create Event
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Total Events
                            </p>

                            <p className="mt-3 text-4xl font-bold">
                                {count}
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Published on this page
                            </p>

                            <p className="mt-3 text-4xl font-bold text-green-600">
                                {publishedCount}
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Draft on this page
                            </p>

                            <p className="mt-3 text-4xl font-bold text-yellow-600">
                                {draftCount}
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Rejected on this page
                            </p>

                            <p className="mt-3 text-4xl font-bold text-red-600">
                                {rejectedCount}
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
                            <Loading />
                        </div>
                    ) : visibleEvents.length === 0 ? (
                        <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
                            <FiCalendar className="mx-auto mb-6 text-6xl text-gray-300" />

                            <h2 className="text-2xl font-bold">
                                No events found
                            </h2>

                            <p className="mt-2 text-muted-foreground">
                                Change the filters or create your first event.
                            </p>

                            <Button
                                className="mt-8"
                                onClick={() =>
                                    navigate("/organizers/create-event")
                                }
                            >
                                <FiPlus className="mr-2" />
                                Create Event
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-8">
                                {visibleEvents.map((event) => {
                                    const badge = getStatusBadge(event.status);

                                    return (
                                        <article
                                            key={event.id}
                                            className="overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            <div className="flex flex-col xl:flex-row">

                                                {/* Image */}

                                                <div className="relative w-full xl:w-96">
                                                    <img
                                                        src={
                                                            event.cover_image ??
                                                            "https://placehold.co/900x700?text=No+Image"
                                                        }
                                                        alt={event.title}
                                                        className="h-72 w-full object-cover xl:h-full"
                                                    />

                                                    <div
                                                        className={`absolute right-5 top-5 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase backdrop-blur-sm ${badge.className}`}
                                                    >
                                                        {badge.icon}
                                                        {event.status}
                                                    </div>
                                                </div>

                                                {/* Content */}

                                                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                                                    <div>
                                                        <div className="mb-5 flex flex-wrap gap-2">
                                                            <span className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                                <FiTag />
                                                                {event.category}
                                                            </span>
                                                        </div>

                                                        <h2 className="text-2xl font-bold sm:text-3xl">
                                                            {event.title}
                                                        </h2>

                                                        <p className="mt-4 line-clamp-2 text-muted-foreground">
                                                            {event.description}
                                                        </p>

                                                        <div className="mt-6 space-y-3 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <FiMapPin className="shrink-0 text-primary" />

                                                                <span>
                                                                    {[
                                                                        event.venue_name,
                                                                        event.city,
                                                                        event.country,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(", ") ||
                                                                        "Location not set"}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <FiCalendar className="shrink-0 text-primary" />

                                                                <span>
                                                                    {new Date(
                                                                        event.start_date
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {event.ticket_types.length > 0 && (
                                                            <div className="mt-8">
                                                                <h3 className="mb-4 font-semibold">
                                                                    Ticket Types
                                                                </h3>

                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                    {event.ticket_types.map(
                                                                        (ticket) => (
                                                                            <div
                                                                                key={ticket.id}
                                                                                className="rounded-xl border bg-gray-50 p-4"
                                                                            >
                                                                                <div className="flex items-center justify-between gap-4">
                                                                                    <h4 className="font-semibold">
                                                                                        {ticket.name}
                                                                                    </h4>

                                                                                    <span className="shrink-0 text-lg font-bold text-primary">
                                                                                        €{ticket.price}
                                                                                    </span>
                                                                                </div>

                                                                                {ticket.description && (
                                                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                                                        {ticket.description}
                                                                                    </p>
                                                                                )}

                                                                                <div className="mt-4 flex items-center justify-between text-sm">
                                                                                    <span>
                                                                                        Remaining
                                                                                    </span>

                                                                                    <span className="font-semibold">
                                                                                        {
                                                                                            ticket.remaining_quantity
                                                                                        }
                                                                                        /
                                                                                        {
                                                                                            ticket.total_quantity
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="mt-8 flex flex-col gap-6 border-t pt-6 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                                                            <div className="min-w-32 w-full rounded-xl border bg-slate-50 px-4 py-3 sm:w-auto">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                                    Ticket Types
                                                                </p>

                                                                <p className="mt-1 text-2xl font-bold">
                                                                    {event.ticket_types.length}
                                                                </p>
                                                            </div>

                                                            <div className="min-w-32 w-full rounded-xl border bg-slate-50 px-4 py-3 sm:w-auto">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                                    Status
                                                                </p>

                                                                <div className="mt-2">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                                                                    >
                                                                        {badge.icon}
                                                                        <span className="ml-2 capitalize">
                                                                            {event.status}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 sm:flex-row">
                                                            <Button
                                                                variant="outline"
                                                                size="lg"
                                                                onClick={() =>
                                                                    navigate(`/organizer/events/preview/${event.id}`)
                                                                }
                                                            >
                                                                <FiEye className="mr-2" />
                                                                Preview
                                                            </Button>

                                                            {event.status === "draft" ? (
                                                                <Button
                                                                    size="lg"
                                                                    onClick={() =>
                                                                        navigate(`/organizer/edit-event/${event.id}`)
                                                                    }
                                                                >
                                                                    <FiEdit className="mr-2" />
                                                                    Edit Event
                                                                </Button>
                                                            ) : event.status === "pending" ? (
                                                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                                    <p className="font-semibold">
                                                                        Review in progress
                                                                    </p>

                                                                    <p className="mt-1">
                                                                        Please wait while our administrators review and approve
                                                                        your event.
                                                                    </p>
                                                                </div>
                                                            ) : event.status === "published" ? (
                                                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                                                    <p className="font-semibold">
                                                                        Your event is live 🎉
                                                                    </p>

                                                                    <p className="mt-1">
                                                                        Your event has been approved and is now visible to
                                                                        everyone.
                                                                    </p>
                                                                </div>
                                                            ) : event.status === "cancelled" ? (
                                                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                                                    <p className="font-semibold">
                                                                        Event cancelled
                                                                    </p>

                                                                    <p className="mt-1">
                                                                        This event has been cancelled and is no longer available.
                                                                    </p>
                                                                </div>
                                                            ) : event.status === "completed" ? (
                                                                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                                                    <p className="font-semibold">
                                                                        Event completed
                                                                    </p>

                                                                    <p className="mt-1">
                                                                        This event has finished successfully.
                                                                    </p>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {/* Pagination */}

                            <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(page - 1) * PAGE_SIZE + 1}–
                                    {Math.min(page * PAGE_SIZE, count)} of {count}
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.max(1, current - 1)
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index + 1
                                    ).map((pageNumber) => (
                                        <Button
                                            key={pageNumber}
                                            variant={
                                                pageNumber === page
                                                    ? "primary"
                                                    : "outline"
                                            }
                                            onClick={() => setPage(pageNumber)}
                                            className="min-w-10 px-3"
                                        >
                                            {pageNumber}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        disabled={page >= totalPages}
                                        onClick={() =>
                                            setPage((current) =>
                                                Math.min(
                                                    totalPages,
                                                    current + 1
                                                )
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </PageContainer>
        </>
    );
}

export default MyEvents;