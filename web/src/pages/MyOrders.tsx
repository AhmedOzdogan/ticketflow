import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiAlertCircle,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiPackage,
    FiRefreshCcw,
    FiShoppingBag,
    FiXCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import Pagination from '../components/ui/Pagination';
import { getOrders, cancelOrder } from '../api/orderApi';
import PageContainer from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import PageDashboard from '../components/ui/PageDashboard';
import AppSelect from "../components/ui/AppSelect";
import SearchInput from "../components/ui/SearchInput";
import type {
    GetOrdersParams,
    OrderListResponse,
    OrderStatus,
} from '../types/order';
import FilterChips from '../components/ui/FilterChips';
import StatsGrid from '../components/ui/StatsGrid';

type OrderStatusFilter = 'all' | OrderStatus;

const statusFilters = [
    {
        label: 'All',
        value: 'all',
        icon: FiShoppingBag,
    },
    {
        label: 'Paid',
        value: 'paid',
        icon: FiCheckCircle,
    },
    {
        label: 'Pending',
        value: 'pending',
        icon: FiClock,
    },
    {
        label: 'Processing',
        value: 'processing',
        icon: FiRefreshCcw,
    },
    {
        label: 'Cancelled',
        value: 'cancelled',
        icon: FiXCircle,
    },
    {
        label: 'Refunded',
        value: 'refunded',
        icon: FiCreditCard,
    },
    {
        label: 'Failed',
        value: 'failed',
        icon: FiAlertCircle,
    },
];

const orderingOptions = [
    {
        label: 'Newest first',
        value: '-created_at',
    },
    {
        label: 'Oldest first',
        value: 'created_at',
    },
    {
        label: 'Highest total',
        value: '-total_price',
    },
    {
        label: 'Lowest total',
        value: 'total_price',
    },
];



export default function MyOrders() {
    const navigate = useNavigate();

    const [ordersData, setOrdersData] =
        useState<OrderListResponse>();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [statusFilter, setStatusFilter] =
        useState<OrderStatusFilter>('all');

    const [ordering, setOrdering] = useState('-created_at');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [statusFilter, ordering]);

    const fetchOrders = async (showRefreshState = false) => {
        try {
            if (showRefreshState) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const params: GetOrdersParams = {
                page,
                pageSize,
                search: debouncedSearch || undefined,
                status:
                    statusFilter === 'all'
                        ? undefined
                        : statusFilter,
                ordering,
            };

            const response = await getOrders(params);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setOrdersData(response);
        } catch (error) {
            console.error('Failed to load orders:', error);

            toast.error(
                'Your orders could not be loaded. Please try again.',
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        void fetchOrders();
    }, [
        page,
        pageSize,
        debouncedSearch,
        statusFilter,
        ordering,
    ]);

    const handleCancelOrder = async (orderId: string) => {
        try {
            await cancelOrder(orderId);

            toast.success('Order cancelled successfully.');

            setOrdersData((current) => {
                if (!current) return current;

                return {
                    ...current,
                    results: current.results.map((order) =>
                        order.id === orderId
                            ? {
                                ...order,
                                status: "cancelled",
                            }
                            : order,
                    ),
                };
            });
        } catch (error) {
            console.error('Failed to cancel order:', error);

            toast.error(
                'The order could not be cancelled. Please try again.',
            );
        }
    };

    const orders = ordersData?.results ?? [];

    const totalPages = Math.max(
        1,
        Math.ceil((ordersData?.count ?? 0) / pageSize),
    );


    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setStatusFilter('all');
        setOrdering('-created_at');
        setPage(1);
    };

    const hasActiveFilters =
        search.trim().length > 0 ||
        statusFilter !== 'all' ||
        ordering !== '-created_at';

    const stats = [
        {
            title: "Total Orders",
            value: ordersData?.stats.total ?? 0,
            icon: FiShoppingBag,
        },
        {
            title: "Paid",
            value: ordersData?.stats.paid ?? 0,
            icon: FiCheckCircle,
            color: "text-green-600",
        },
        {
            title: "Pending",
            value: ordersData?.stats.pending ?? 0,
            icon: FiClock,
            color: "text-yellow-600",
        },
        {
            title: "Processing",
            value: ordersData?.stats.processing ?? 0,
            icon: FiRefreshCcw,
            color: "text-indigo-600",
        },
        {
            title: "Cancelled",
            value: ordersData?.stats.cancelled ?? 0,
            icon: FiXCircle,
            color: "text-red-600",
        },
        {
            title: "Failed",
            value: ordersData?.stats.failed ?? 0,
            icon: FiAlertCircle,
            color: "text-orange-600",
        },
        {
            title: "Expired",
            value: ordersData?.stats.expired ?? 0,
            icon: FiClock,
            color: "text-slate-600",
        },
        {
            title: "Refunded",
            value: ordersData?.stats.refunded ?? 0,
            icon: FiCreditCard,
            color: "text-blue-600",
        },
    ];

    console.log(ordersData)
    console.log(orders)
    return (
        <>
            <PageContainer
                title="My Orders"
                description="Review your purchases, payment statuses and tickets."
            >

                <PageDashboard
                    filters={
                        <FilterChips
                            value={statusFilter}
                            options={statusFilters}
                            onChange={(value) => {
                                setPage(1);
                                setStatusFilter(value as OrderStatusFilter);
                            }}
                            trailing={
                                hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10 xl:ml-auto"
                                    >
                                        <FiAlertCircle />
                                        Clear filters
                                    </button>
                                )
                            }
                        />
                    }
                >
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by event title or status..."
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <AppSelect
                            value={ordering}
                            onChange={setOrdering}
                            options={orderingOptions}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            className="flex h-12 items-center justify-center gap-2"
                            disabled={isRefreshing}
                            onClick={() => void fetchOrders(true)}
                        >
                            <FiRefreshCcw
                                className={isRefreshing ? 'animate-spin' : ''}
                            />
                            Refresh
                        </Button>
                    </div>
                </PageDashboard>

                <StatsGrid items={stats} columns={4} />

                <div className="mt-8">
                    {isLoading ? (
                        <div className="rounded-2xl border border-border bg-surface p-16 text-center shadow-sm">
                            <Loading />
                        </div>
                    ) : ordersData?.results.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center shadow-sm">
                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <FiPackage size={34} />
                            </span>

                            <h2 className="mt-6 text-2xl font-black text-foreground">
                                No orders found
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-muted">
                                You haven't placed any orders yet or no
                                orders match your current filters.
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
                            {orders.map((order) => {
                                const totalTickets = order.items.reduce(
                                    (sum, item) =>
                                        sum + item.quantity,
                                    0,
                                );

                                const paid =
                                    order.status === 'paid';

                                const pending =
                                    order.status ===
                                    'pending' ||
                                    order.status ===
                                    'processing';

                                const refunded =
                                    order.status ===
                                    'refunded';

                                const cancelled =
                                    order.status ===
                                    'cancelled' ||
                                    order.status ===
                                    'failed' ||
                                    order.status ===
                                    'expired';

                                let badgeClass =
                                    'bg-success/10 text-success';

                                let badgeText =
                                    'Paid';

                                if (pending) {
                                    badgeClass =
                                        'bg-warning/20 text-foreground';
                                    badgeText =
                                        'Pending';
                                }

                                if (cancelled) {
                                    badgeClass =
                                        'bg-danger/10 text-danger';
                                    badgeText =
                                        'Cancelled';
                                }

                                if (refunded) {
                                    badgeClass =
                                        'bg-accent/10 text-accent';
                                    badgeText =
                                        'Refunded';
                                }

                                return (
                                    <div
                                        key={order.id}
                                        className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-surface-muted sm:h-64 lg:h-auto lg:w-80 lg:self-stretch">
                                                <img
                                                    src={order.event_cover_image}
                                                    alt={order.event_title}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex flex-1 flex-col p-6 lg:p-8">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-foreground">
                                                            {
                                                                order.event_title
                                                            }
                                                        </h2>

                                                        <p className="mt-2 text-sm text-muted">
                                                            Order #
                                                            {order.id.slice(
                                                                0,
                                                                8,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${badgeClass}`}
                                                    >
                                                        {
                                                            badgeText
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-8 grid gap-4 md:grid-cols-4">
                                                    <div className="rounded-2xl border border-border bg-background p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                            Purchased
                                                        </p>

                                                        <p className="mt-2 font-bold">
                                                            {new Date(
                                                                order.created_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-border bg-background p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                            Tickets
                                                        </p>

                                                        <p className="mt-2 text-2xl font-black text-primary">
                                                            {
                                                                totalTickets
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-border bg-background p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                            Total
                                                        </p>

                                                        <p className="mt-2 text-2xl font-black text-primary">
                                                            {
                                                                order.currency
                                                            }{' '}
                                                            {
                                                                order.total_price
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border border-border bg-background p-4">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                                            Paid At
                                                        </p>

                                                        <p className="mt-2 font-bold">
                                                            {order.paid_at
                                                                ? new Date(
                                                                    order.paid_at,
                                                                ).toLocaleDateString()
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-8 rounded-2xl border border-border bg-background p-5">
                                                    <h3 className="text-lg font-black">
                                                        Order Summary
                                                    </h3>

                                                    <div className="mt-4 space-y-3">
                                                        {order.items.map(
                                                            (
                                                                item,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
                                                                >
                                                                    <div>
                                                                        <p className="font-bold">
                                                                            {
                                                                                item.ticket_type_name
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm text-muted">
                                                                            Quantity:{' '}
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </p>
                                                                    </div>

                                                                    <p className="font-black text-primary">
                                                                        {
                                                                            order.currency
                                                                        }{' '}
                                                                        {
                                                                            item.total_price
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex flex-wrap gap-3">
                                                    {paid && (
                                                        <Button variant="outline" onClick={() => navigate(`/my-tickets/${order.id}`)}>
                                                            View Tickets
                                                        </Button>
                                                    )}

                                                    {pending && (
                                                        <>
                                                            <Button>
                                                                Continue
                                                                Payment
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleCancelOrder(order.id)
                                                                }>
                                                                Cancel
                                                                Order
                                                            </Button>
                                                        </>
                                                    )}
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
                    loading={isLoading}
                    onPageChange={setPage}
                />
            </PageContainer >
        </>
    );
}