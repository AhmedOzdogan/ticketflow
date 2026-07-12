import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    FiCheckCircle,
    FiClock,
    FiRefreshCcw,
    FiSearch,
    FiChevronDown,
} from 'react-icons/fi';
import { TfiTicket } from "react-icons/tfi";
import { toast } from 'sonner';
import { getTickets } from '../api/orderApi';
import { downloadTicket } from '../api/orderApi';
import PageContainer from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import QRCode from 'react-qr-code';

import type {
    GetTicketsParams,
    TicketListResponse,
    TicketStatus,
} from '../types/order';
import { Loading } from '../components/ui/Loading';

type TicketStatusFilter = 'all' | TicketStatus;

const statusFilters: {
    label: string;
    value: TicketStatusFilter;
}[] = [
        {
            label: 'All',
            value: 'all',
        },
        {
            label: 'Active',
            value: 'active',
        },
        {
            label: 'Used',
            value: 'used',
        },
    ];


const orderingOptions = [
    {
        label: 'Newest',
        value: '-created_at',
    },
    {
        label: 'Oldest',
        value: 'created_at',
    },
];

const initialData: TicketListResponse = {
    count: 0,
    next: null,
    previous: null,
    results: [],
};

export default function MyTickets() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const eventId =
        searchParams.get('event') ?? undefined;

    const [ticketsData, setTicketsData] =
        useState<TicketListResponse>(
            initialData,
        );

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [page, setPage] =
        useState(1);

    const pageSize = 10;

    const [search, setSearch] =
        useState('');

    const [debouncedSearch, setDebouncedSearch] =
        useState('');

    const [status, setStatus] =
        useState<TicketStatusFilter>('all');

    const [ticketType, setTicketType] = useState('');

    const [ordering, setOrdering] =
        useState('-created_at');

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 400);

        return () => {
            clearTimeout(timeout);
        };
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [
        status,
        ticketType,
        ordering,
    ]);

    const fetchTickets = async (
        refresh = false,
    ) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const params: GetTicketsParams = {
                page,
                pageSize,
                event: eventId,
                search:
                    debouncedSearch || undefined,
                status:
                    status === 'all'
                        ? undefined
                        : status,
                ticketType:
                    ticketType || undefined,
                ordering,
            };

            const response =
                await getTickets(params);

            setTicketsData(response);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error(error);

            toast.error(
                'Tickets could not be loaded.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        void fetchTickets();
    }, [
        page,
        debouncedSearch,
        status,
        ticketType,
        ordering,
        eventId,
    ]);

    const tickets =
        ticketsData.results;

    const totalPages = Math.max(
        1,
        Math.ceil(
            ticketsData.count / pageSize,
        ),
    );

    const ticketTypes = useMemo(() => {
        const unique = new Map<
            string,
            { id: string; name: string }
        >();

        tickets.forEach((ticket) => {
            unique.set(ticket.ticket_type_id, {
                id: ticket.ticket_type_id,
                name: ticket.ticket_type_name,
            });
        });

        return [
            {
                id: '',
                name: 'All',
            },
            ...Array.from(unique.values()),
        ];
    }, [tickets]);

    const statistics = useMemo(() => {
        return {
            total:
                ticketsData.count,

            active: tickets.filter(
                (
                    ticket,
                ) =>
                    ticket.status ===
                    'active',
            ).length,

            used: tickets.filter(
                (
                    ticket,
                ) =>
                    ticket.status ===
                    'used',
            ).length,
        };
    }, [ticketsData]);

    const handleDownloadTicket = async (
        ticketId: string,
    ) => {
        try {
            const blob =
                await downloadTicket(ticketId);

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement('a');

            link.href = url;

            link.download = `ticket-${ticketId}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success(
                'Ticket downloaded successfully.',
            );
        } catch (error) {
            console.error(error);

            toast.error(
                'Failed to download ticket.',
            );
        }
    };

    return (
        <>
            <PageContainer
                title="My Tickets"
                description="Manage every ticket you've purchased.">

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted">
                                    Total Tickets
                                </p>

                                <p className="mt-2 text-3xl font-black text-foreground">
                                    {statistics.total}
                                </p>
                            </div>

                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <TfiTicket size={26} />
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-black text-foreground">
                                    {statistics.active}
                                </p>
                            </div>

                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                                <FiCheckCircle size={26} />
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted">
                                    Used
                                </p>

                                <p className="mt-2 text-3xl font-black text-foreground">
                                    {statistics.used}
                                </p>
                            </div>

                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
                                <FiClock size={26} />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full xl:max-w-md">
                            <FiSearch
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                size={18}
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by event or ticket type..."
                                className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <select
                                    value={ticketType}
                                    onChange={(event) =>
                                        setTicketType(event.target.value)
                                    }
                                    className="h-12 min-w-44 appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    {ticketTypes.map((type) => (
                                        <option
                                            key={type.id}
                                            value={type.id}
                                        >
                                            {type.name}
                                        </option>
                                    ))}
                                </select>

                                <FiChevronDown
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                                    size={16}
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={ordering}
                                    onChange={(event) =>
                                        setOrdering(event.target.value)
                                    }
                                    className="h-12 min-w-44 appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    {orderingOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <FiChevronDown
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                                    size={16}
                                />
                            </div>

                            <Button
                                variant="outline"
                                disabled={loading || refreshing}
                                onClick={() => void fetchTickets(true)}
                                className="flex h-12 items-center justify-center gap-2"
                            >
                                <FiRefreshCcw
                                    className={
                                        refreshing ? 'animate-spin' : ''
                                    }
                                />

                                Refresh
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setStatus(filter.value)}
                                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${status === filter.value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background text-muted hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    {loading ? (
                        <div className="rounded-2xl border border-border bg-surface p-20 text-center shadow-sm">
                            <Loading />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center shadow-sm">
                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <TfiTicket size={36} />
                            </span>

                            <h2 className="mt-6 text-3xl font-black text-foreground">
                                No Tickets
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-muted">
                                You don't have any tickets matching these
                                filters.
                            </p>

                            <Button
                                className="mt-8"
                                onClick={() => navigate('/events')}
                            >
                                Browse Events
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {tickets.map((ticket) => {
                                const active = ticket.status === 'active';

                                return (
                                    <div
                                        key={ticket.id}
                                        className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="h-64 bg-surface-muted lg:h-auto lg:w-72">
                                                <img
                                                    src={
                                                        ticket.event_cover_image
                                                    }
                                                    alt={ticket.event_title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col p-6 lg:p-8">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-foreground">
                                                            {
                                                                ticket.event_title
                                                            }
                                                        </h2>

                                                        <p className="mt-2 text-lg font-bold text-muted">
                                                            {
                                                                ticket.ticket_type_name.toLocaleUpperCase()
                                                            }{' '}
                                                            Ticket
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-bold ${active
                                                            ? 'bg-success/10 text-success'
                                                            : 'bg-danger/10 text-danger'
                                                            }`}
                                                    >
                                                        {active
                                                            ? 'ACTIVE'
                                                            : 'USED'}
                                                    </span>
                                                </div>

                                                <div className="mt-8 grid gap-6 lg:grid-rows">

                                                    <div className="rounded-2xl border border-border bg-background p-5 text-center">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                            QR Code
                                                        </p>

                                                        <div className="mt-5 flex justify-center">
                                                            <QRCode
                                                                value={
                                                                    ticket.qr_code
                                                                }
                                                                size={160}
                                                                bgColor="transparent"
                                                            />
                                                        </div>

                                                        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                                                            Ticket ID
                                                        </p>

                                                        <p className="mt-2 break-all text-sm font-bold text-foreground">
                                                            {ticket.id}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-8 border-t border-border pt-6">
                                                    <div className="flex flex-wrap gap-3">

                                                        <Button
                                                            onClick={() =>
                                                                handleDownloadTicket(ticket.id)
                                                            }
                                                        >
                                                            Download PDF
                                                        </Button>

                                                        <Button variant="outline">
                                                            Add to Wallet
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row">
                        <p className="text-sm text-muted">
                            Showing page{' '}
                            <span className="font-bold text-foreground">
                                {page}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-foreground">
                                {totalPages}
                            </span>
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() =>
                                    setPage((previous) =>
                                        Math.max(previous - 1, 1),
                                    )
                                }
                            >
                                Previous
                            </Button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1,
                            )
                                .slice(
                                    Math.max(0, page - 3),
                                    Math.min(totalPages, page + 2),
                                )
                                .map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() =>
                                            setPage(pageNumber)
                                        }
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition ${page === pageNumber
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-background hover:border-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() =>
                                    setPage((previous) =>
                                        Math.min(
                                            previous + 1,
                                            totalPages,
                                        ),
                                    )
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </PageContainer>
        </>
    );
}