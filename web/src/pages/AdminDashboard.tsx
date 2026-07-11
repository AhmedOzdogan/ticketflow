import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getStats, getUsers, updateOrganizerStatus } from '../api/authApi';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import AuthGate from './AuthGate';
import AdminLayout from '../components/admin/AdminLayout';
import AdminToolbar from '../components/admin/AdminToolbar';
import AdminTable from '../components/admin/AdminTable';
import StatusBadge from '../components/admin/StatusBadge';
import type { AdminMenuItem } from '../components/admin/AdminSidebar';

type ApprovalStatus = 'approved' | 'pending' | 'rejected';
type FilterStatus = 'all' | ApprovalStatus;
type AdminView = 'buyers' | 'organizers' | 'admins';


interface OrganizerProfile {
    company_name: string;
    website_url: string;
    organizer_details: string;
    rejection_reason: string | null;
}

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    organizer_approval_status: ApprovalStatus;
    organizer_profile: OrganizerProfile | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface OrganizerStatusState {
    status: ApprovalStatus;
    rejectionReason: string;
}

interface UserStats {
    total_users: number;
    buyers: number;
    organizers: number;
    admins: number;
    pending_organizers: number;
    approved_organizers: number;
    rejected_organizers: number;
    verified_users: number;
    unverified_users: number;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [organizers, setOrganizers] = useState<PaginatedResponse<User>>({
        count: 0,
        next: null,
        previous: null,
        results: [],
    });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statusState, setStatusState] = useState<Record<string, OrganizerStatusState>>({});
    const [filter, setFilter] = useState<FilterStatus>('all');

    const [activeView, setActiveView] = useState<AdminView>('organizers');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10 as const;

    const activeRole =
        activeView === 'admins'
            ? 'admin'
            : activeView === 'organizers'
                ? 'organizer'
                : 'buyer';

    const adminMenu: AdminMenuItem[] = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'buyers', label: 'Buyers', onClick: () => setActiveView('buyers') },
        { key: 'organizers', label: 'Organizers', onClick: () => setActiveView('organizers') },
        { key: 'admins', label: 'Admins', onClick: () => setActiveView('admins') },
        { key: 'events', label: 'Events' },
        { key: 'orders', label: 'Orders' },
        { key: 'tickets', label: 'Tickets' },
        { key: 'settings', label: 'Settings' },
    ];

    interface FetchUsersOptions {
        role?: string;
        page?: number;
        pageSize?: number;
        search?: string;
        ordering?: string;
        organizerApprovalStatus?: string;
        isEmailVerified?: boolean;
    }

    const fetchUsers = useCallback(
        async (options: FetchUsersOptions = {}) => {
            setLoading(true);
            setErrorMessage(null);

            try {
                const data = await getUsers(options);

                setOrganizers(data);

                const initialStatusState: Record<string, OrganizerStatusState> = {};

                data.results.forEach((user: User) => {
                    initialStatusState[user.id] = {
                        status: user.organizer_approval_status,
                        rejectionReason:
                            user.organizer_profile?.rejection_reason ?? '',
                    };
                });

                setStatusState(initialStatusState);
            } catch (error) {
                console.error(error);
                setErrorMessage(
                    'Could not load users. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        if (user?.role === 'admin') {
            void fetchUsers({
                role: activeRole,
                search: searchQuery || undefined,
                page: currentPage,
                pageSize: PAGE_SIZE,
                organizerApprovalStatus:
                    activeView === 'organizers' && filter !== 'all'
                        ? filter
                        : undefined,
            });
        }
    }, [fetchUsers, user?.role, activeRole, searchQuery, currentPage, filter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeView, searchQuery, filter]);

    const filteredOrganizers = useMemo(
        () => organizers.results,
        [organizers],

    );

    const fetchStats = useCallback(async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') {
            void fetchStats();
        }
    }, [fetchStats, user?.role]);

    const totalPages = Math.max(1, Math.ceil(organizers.count / PAGE_SIZE));

    const handleStatusChange = (id: string, value: ApprovalStatus) => {
        setStatusState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: value,
                rejectionReason: value === 'rejected' ? prev[id]?.rejectionReason ?? '' : '',
            },
        }));
    };

    const handleRejectionReasonChange = (id: string, value: string) => {
        setStatusState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                rejectionReason: value,
            },
        }));
    };

    const handleUpdateStatus = async (
        id: string,
        status: ApprovalStatus,
        rejectionReason: string,
    ) => {
        if (status === 'pending') {
            setErrorMessage('Please choose Approve organizer or Reject organizer before updating.');
            return;
        }

        if (status === 'rejected' && !rejectionReason.trim()) {
            setErrorMessage('Please enter a rejection reason before rejecting this organizer.');
            return;
        }

        setUpdatingId(id);
        setErrorMessage(null);

        try {
            await updateOrganizerStatus(id, status, rejectionReason);
            await fetchUsers({
                role: activeRole,
                search: searchQuery || undefined,
                page: currentPage,
                pageSize: PAGE_SIZE,
                organizerApprovalStatus:
                    activeView === 'organizers' && filter !== 'all'
                        ? filter
                        : undefined,
            });
            await fetchStats();
        } catch (error) {
            console.error(error);
            setErrorMessage('Could not update organizer status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    if (!user) {
        return <AuthGate />;
    }
    if (user.role !== 'admin') {
        return <AuthGate variant="unauthorized" />;
    }
    return (
        <AdminLayout
            title="Admin Management"
            subtitle="Review and manage organizer users."
            activeMenu={activeView}
            adminEmail={user.email}
            menuItems={adminMenu}
            toolbar={
                <AdminToolbar
                    title="Organizer Applications"
                    description="Showing organizer accounts from the user list."
                >
                    <div className="mt-3 flex w-full flex-col gap-3 sm:mt-0 lg:w-auto lg:flex-row lg:items-center">
                        <div className="w-full lg:w-72">
                            <label htmlFor="organizer-search" className="sr-only">
                                {activeView === 'organizers'
                                    ? 'Search organizers'
                                    : activeView === 'admins'
                                        ? 'Search admins'
                                        : 'Search users'}
                            </label>
                            <input
                                id="organizer-search"
                                type="search"
                                placeholder={
                                    activeView === 'organizers'
                                        ? 'Search organizers...'
                                        : activeView === 'admins'
                                            ? 'Search admins...'
                                            : 'Search users...'
                                }
                                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground placeholder:text-black focus:border-muted focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <Button
                                variant="ghost"
                                className={`w-full rounded-none border px-3 py-2 text-sm shadow-none sm:w-auto ${filter === 'all'
                                    ? 'border-muted bg-muted text-primary-foreground'
                                    : 'border-border bg-surface text-foreground hover:border-muted'
                                    }`}
                                onClick={() => setFilter('all')}
                            >
                                All ({stats?.organizers})
                            </Button>
                            {activeView === 'organizers' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        className={`w-full rounded-none border px-3 py-2 text-sm shadow-none sm:w-auto ${filter === 'pending'
                                            ? 'border-muted bg-muted text-primary-foreground'
                                            : 'border-border bg-surface text-foreground hover:border-muted'
                                            }`}
                                        onClick={() => setFilter('pending')}
                                    >
                                        Pending ({stats?.pending_organizers})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className={`w-full rounded-none border px-3 py-2 text-sm shadow-none sm:w-auto ${filter === 'approved'
                                            ? 'border-muted bg-muted text-primary-foreground'
                                            : 'border-border bg-surface text-foreground hover:border-muted'
                                            }`}
                                        onClick={() => setFilter('approved')}
                                    >
                                        Approved ({stats?.approved_organizers})
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className={`w-full rounded-none border px-3 py-2 text-sm shadow-none sm:w-auto ${filter === 'rejected'
                                            ? 'border-muted bg-muted text-primary-foreground'
                                            : 'border-border bg-surface text-foreground hover:border-muted'
                                            }`}
                                        onClick={() => setFilter('rejected')}
                                    >
                                        Rejected ({stats?.rejected_organizers})
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </AdminToolbar>
            }
        >
            {errorMessage && (
                <div className="mt-4 border border-danger/20 bg-danger/5 px-5 py-4 text-sm font-bold text-danger">
                    {errorMessage}
                </div>
            )}
            {stats && (
                <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    <div className="border border-border bg-surface p-4">
                        <div className="text-sm text-muted-foreground"> Total Users</div>
                        <div className="mt-2 text-3xl font-bold">{stats.total_users}</div>
                    </div>

                    <div className="border border-border bg-surface p-4">
                        <div className="text-sm text-muted-foreground">Buyers</div>
                        <div className="mt-2 text-3xl font-bold">{stats.buyers}</div>
                    </div>

                    <div className="border border-border bg-surface p-4">
                        <div className="text-sm text-muted-foreground">Organizers</div>
                        <div className="mt-2 text-3xl font-bold">{stats.organizers}</div>

                        <div className="mt-2 text-xs text-muted-foreground">
                            {stats.pending_organizers} Pending •{" "}
                            {stats.approved_organizers} Approved •{" "}
                            {stats.rejected_organizers} Rejected
                        </div>
                    </div>

                    <div className="border border-border bg-surface p-4">
                        <div className="text-sm text-muted-foreground">Admins</div>
                        <div className="mt-2 text-3xl font-bold">{stats.admins}</div>
                    </div>
                </div>
            )}
            <AdminTable
                loading={loading}
                empty={!loading && filteredOrganizers.length === 0}
                emptyTitle="No organizers found"
                emptyDescription="There are no organizers matching the selected filter."
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse bg-white text-sm">
                        <thead>
                            <tr>
                                <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">#</th>
                                <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">
                                    {activeView === 'organizers' ? 'Organizer' : 'Name'}
                                </th>
                                {activeView === 'organizers' && (
                                    <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Company</th>
                                )}
                                <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Email</th>
                                <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Phone</th>
                                {activeView === 'organizers' && (
                                    <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Website</th>
                                )}
                                {activeView === 'organizers' && (
                                    <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Description</th>
                                )}
                                {activeView === 'organizers' && (
                                    <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Status</th>
                                )}
                                {activeView === 'organizers' && (
                                    <th className="border border-muted bg-muted px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">
                                        Decision
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrganizers.map((org, idx) => {
                                const selectedStatus = statusState[org.id]?.status ?? org.organizer_approval_status;
                                const rejectionReason = statusState[org.id]?.rejectionReason ?? '';
                                const isUpdating = updatingId === org.id;
                                return (
                                    <tr
                                        key={org.id}
                                        className="border-b border-border odd:bg-surface even:bg-surface-muted"
                                    >
                                        <td className="border border-border px-4 py-3 align-top text-sm font-bold text-foreground">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td className="border border-border px-4 py-3 align-top text-foreground whitespace-normal break-words">
                                            <div className="font-semibold text-foreground">{org.first_name} {org.last_name}</div>
                                        </td>
                                        {activeView === 'organizers' && (
                                            <td className="border border-border px-4 py-3 align-top text-foreground">
                                                <div className="font-semibold text-foreground">
                                                    {org.organizer_profile?.company_name || 'N/A'}
                                                </div>
                                            </td>
                                        )}
                                        <td className="border border-border px-4 py-3 align-top whitespace-normal break-words">
                                            <div className="break-all font-semibold text-foreground">{org.email}</div>
                                        </td>
                                        <td className="border border-border px-4 py-3 align-top whitespace-normal break-words">
                                            <div className="font-semibold text-foreground">{org.phone_number || 'N/A'}</div>
                                        </td>
                                        {activeView === 'organizers' && (
                                            <td className="border border-border px-4 py-3 align-top">
                                                {org.organizer_profile?.website_url ? (
                                                    <a
                                                        href={org.organizer_profile.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="break-all text-muted hover:underline"
                                                    >
                                                        {org.organizer_profile.website_url}
                                                    </a>
                                                ) : (
                                                    <div className="text-muted-foreground">N/A</div>
                                                )}
                                            </td>
                                        )}
                                        {activeView === 'organizers' && (
                                            <td className="border border-border px-4 py-3 align-top text-foreground whitespace-normal break-words">
                                                <div>
                                                    {org.organizer_profile?.organizer_details || <span className="text-muted-foreground">N/A</span>}
                                                </div>
                                            </td>
                                        )}
                                        {activeView === 'organizers' && (
                                            <td className="border border-border px-4 py-3 align-top whitespace-normal break-words">
                                                <StatusBadge status={org.organizer_approval_status} />
                                            </td>
                                        )}
                                        {activeView === 'organizers' && (
                                            <td className="border border-border px-4 py-3 align-top min-w-[240px]">
                                                <div className="flex flex-col gap-2">
                                                    <select
                                                        id={`status-select-${org.id}`}
                                                        className="h-11 w-full appearance-none rounded-xl border border-border bg-surface px-3 pr-10 text-sm font-semibold text-foreground focus:border-muted focus:outline-none"
                                                        value={selectedStatus}
                                                        onChange={(event) => handleStatusChange(org.id, event.target.value as ApprovalStatus)}
                                                    >
                                                        <option value="pending" disabled>
                                                            Select a decision
                                                        </option>
                                                        <option value="approved">Approve organizer</option>
                                                        <option value="rejected">Reject organizer</option>
                                                    </select>
                                                    {selectedStatus === 'rejected' && (
                                                        <input
                                                            type="text"
                                                            placeholder="Rejection reason"
                                                            className="w-full border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger focus:border-muted focus:outline-none"
                                                            value={rejectionReason}
                                                            onChange={(event) => handleRejectionReasonChange(org.id, event.target.value)}
                                                        />
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        className={`rounded-none border px-3 py-2 text-sm shadow-none border-muted bg-muted text-primary-foreground`}
                                                        disabled={isUpdating}
                                                        onClick={() => handleUpdateStatus(org.id, selectedStatus, rejectionReason)}
                                                    >
                                                        {isUpdating ? 'Updating...' : 'Update'}
                                                    </Button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </AdminTable>

            <div className="mt-4 flex flex-col gap-3 border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} • {organizers.count} total users
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        className="rounded-none border border-border"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.max(5, currentPage + 2))
                        .map((page) => (
                            <Button
                                key={page}
                                variant="ghost"
                                className={page === currentPage ? 'rounded-none border border-muted bg-muted text-primary-foreground' : 'rounded-none border border-border'}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}

                    <Button
                        variant="ghost"
                        className="rounded-none border border-border"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;