import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
    FiCheckCircle,
    FiClock,
    FiRefreshCcw,
    FiXCircle,
} from 'react-icons/fi';
import { TfiTicket } from "react-icons/tfi";
import { toast } from 'sonner';
import { getTickets } from '../api/orderApi';
import { downloadTicket } from '../api/orderApi';
import PageContainer from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import QRCode from 'react-qr-code';
import PageDashboard from '../components/ui/PageDashboard';
import AppSelect from "../components/ui/AppSelect";
import SearchInput from "../components/ui/SearchInput";
import type {
    GetTicketsParams,
    TicketListResponse,
    TicketStatus,
} from '../types/order';
import { Loading } from '../components/ui/Loading';
import FilterChips from '../components/ui/FilterChips';
import StatsGrid from '../components/ui/StatsGrid';
import Pagination from '../components/ui/Pagination';

type TicketStatusFilter = 'all' | TicketStatus;

const statusFilters = [
    {
        label: 'All',
        value: 'all',
        icon: TfiTicket,
    },
    {
        label: 'Active',
        value: 'active',
        icon: FiCheckCircle,
    },
    {
        label: 'Used',
        value: 'used',
        icon: FiClock,
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

export default function MyTickets() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const eventId =
        searchParams.get('event') ?? undefined;

    const [ticketsData, setTicketsData] =
        useState<TicketListResponse>();

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
                order_id: id,
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
        id,
        page,
        debouncedSearch,
        status,
        ticketType,
        ordering,
        eventId,
    ]);

    const tickets =
        ticketsData?.results ?? [];

    const totalPages = Math.max(
        1,
        Math.ceil(
            (ticketsData?.count ?? 0) / pageSize,
        ),
    );

    const ticketTypes = useMemo(() => {
        const unique = new Map<
            string,
            { id: string; name: string }
        >();

        ticketsData?.results.forEach((ticket) => {
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

    const stats = [
        {
            title: "Total Tickets",
            value: ticketsData?.stats.total ?? 0,
            icon: TfiTicket,
        },
        {
            title: "Active",
            value: ticketsData?.stats.active ?? 0,
            icon: FiCheckCircle,
            color: "text-green-600",
        },
        {
            title: "Used",
            value: ticketsData?.stats.used ?? 0,
            icon: FiClock,
            color: "text-yellow-600",
        },
        {
            title: "Cancelled",
            value: ticketsData?.stats.cancelled ?? 0,
            icon: FiXCircle,
            color: "text-red-600",
        },
        {
            title: "Refunded",
            value: ticketsData?.stats.refunded ?? 0,
            icon: FiRefreshCcw,
            color: "text-blue-600",
        },
    ];

    return (
        <>
            <PageContainer
                title="My Tickets"
                description="Manage every ticket you've purchased.">


                <PageDashboard
                    filters={
                        <FilterChips
                            value={status}
                            options={statusFilters}
                            onChange={(value) => {
                                setPage(1);
                                setStatus(value as TicketStatusFilter);
                            }}
                        />
                    }
                >
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by event or ticket type..."
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <AppSelect
                            value={ticketType}
                            onChange={setTicketType}
                            options={ticketTypes.map((type) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                        />

                        <AppSelect
                            value={ordering}
                            onChange={setOrdering}
                            options={orderingOptions}
                        />

                        <Button
                            variant="outline"
                            disabled={loading || refreshing}
                            onClick={() => void fetchTickets(true)}
                            className="h-12 gap-2"
                        >
                            <FiRefreshCcw
                                className={refreshing ? 'animate-spin' : ''}
                            />
                            Refresh
                        </Button>
                    </div>
                </PageDashboard>

                <StatsGrid items={stats} columns={5} />

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


                <Pagination
                    page={page}
                    totalPages={totalPages}
                    loading={loading}
                    onPageChange={setPage}
                />
            </PageContainer>
        </>
    );
}