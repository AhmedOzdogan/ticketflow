import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentOrganizers, updateOrganizerStatus } from '../api/authApi';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import AuthGate from './AuthGate';

type ApprovalStatus = 'approved' | 'pending' | 'rejected';
type FilterStatus = 'all' | ApprovalStatus;

interface OrganizerProfile {
    company_name: string;
    website_url: string;
    organizer_details: string;
    rejection_reason: string | null;
}

interface Organizer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    organizer_approval_status: ApprovalStatus;
    organizer_profile: OrganizerProfile | null;
}

interface OrganizerStatusState {
    status: ApprovalStatus;
    rejectionReason: string;
}

function getStatusBadgeClasses(status: ApprovalStatus) {
    if (status === 'approved') {
        return 'bg-success/15 text-success border border-success/30';
    }

    if (status === 'rejected') {
        return 'bg-danger/15 text-danger border border-danger/30';
    }

    return 'bg-secondary/25 text-foreground border border-secondary';
}

function formatStatus(status: ApprovalStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [statusState, setStatusState] = useState<Record<string, OrganizerStatusState>>({});
    const [filter, setFilter] = useState<FilterStatus>('all');

    const fetchOrganizers = useCallback(async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const data = await getCurrentOrganizers();
            setOrganizers(data);

            const initialStatus: Record<string, OrganizerStatusState> = {};

            data.forEach((org: Organizer) => {
                initialStatus[org.id] = {
                    status: org.organizer_approval_status,
                    rejectionReason: org.organizer_profile?.rejection_reason ?? '',
                };
            });

            setStatusState(initialStatus);
        } catch (error) {
            console.error(error);
            setErrorMessage('Could not load organizer applications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') {
            void fetchOrganizers();
        }
    }, [fetchOrganizers, user?.role]);

    const counts = useMemo(
        () => ({
            all: organizers.length,
            pending: organizers.filter((org) => org.organizer_approval_status === 'pending').length,
            approved: organizers.filter((org) => org.organizer_approval_status === 'approved').length,
            rejected: organizers.filter((org) => org.organizer_approval_status === 'rejected').length,
        }),
        [organizers],
    );

    const filteredOrganizers = useMemo(
        () => organizers.filter((org) => (filter === 'all' ? true : org.organizer_approval_status === filter)),
        [filter, organizers],
    );

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
            await fetchOrganizers();
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
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="relative flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <section className="flex flex-col gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight">Organizer Management</h1>
                            <p className="mt-2 text-sm text-muted">Review, approve and reject organizer applications.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
                                All ({counts.all})
                            </Button>
                            <Button variant={filter === 'pending' ? 'primary' : 'outline'} onClick={() => setFilter('pending')}>
                                Pending ({counts.pending})
                            </Button>
                            <Button variant={filter === 'approved' ? 'primary' : 'outline'} onClick={() => setFilter('approved')}>
                                Approved ({counts.approved})
                            </Button>
                            <Button variant={filter === 'rejected' ? 'primary' : 'outline'} onClick={() => setFilter('rejected')}>
                                Rejected ({counts.rejected})
                            </Button>
                        </div>
                    </section>

                    {errorMessage && (
                        <div className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-4 text-sm font-bold text-danger">
                            {errorMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredOrganizers.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                                    <h3 className="text-xl font-bold">No organizers found</h3>
                                    <p className="mt-2 text-muted">There are no organizers matching the selected filter.</p>
                                </div>
                            )}

                            {filteredOrganizers.map((org) => {
                                const selectedStatus = statusState[org.id]?.status ?? org.organizer_approval_status;
                                const rejectionReason = statusState[org.id]?.rejectionReason ?? '';
                                const isUpdating = updatingId === org.id;

                                return (
                                    <article
                                        key={org.id}
                                        className="rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8"
                                    >
                                        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tight">
                                                    {org.first_name} {org.last_name}
                                                </h2>
                                                <p className="mt-1 text-sm uppercase tracking-widest text-muted">
                                                    {org.organizer_profile?.company_name || 'N/A'}
                                                </p>
                                            </div>

                                            <span className={`inline-flex w-fit rounded-full px-4 py-1 text-sm font-semibold ${getStatusBadgeClasses(org.organizer_approval_status)}`}>
                                                {formatStatus(org.organizer_approval_status)}
                                            </span>
                                        </header>

                                        <div className="grid gap-6 lg:grid-cols-3">
                                            <div className="flex flex-col rounded-xl border border-border bg-surface-muted p-4">
                                                <span className="mb-1 text-xs uppercase tracking-widest text-muted">Email</span>
                                                <span className="break-all font-semibold text-foreground">{org.email}</span>
                                            </div>

                                            <div className="flex flex-col rounded-xl border border-border bg-surface-muted p-4">
                                                <span className="mb-1 text-xs uppercase tracking-widest text-muted">Phone</span>
                                                <span className="font-semibold text-foreground">{org.phone_number || 'N/A'}</span>
                                            </div>

                                            <div className="flex flex-col rounded-xl border border-border bg-surface-muted p-4">
                                                <span className="mb-1 text-xs uppercase tracking-widest text-muted">Website</span>
                                                {org.organizer_profile?.website_url ? (
                                                    <a
                                                        href={org.organizer_profile.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="break-all font-semibold text-foreground hover:underline"
                                                    >
                                                        {org.organizer_profile.website_url}
                                                    </a>
                                                ) : (
                                                    <span className="font-semibold text-muted">N/A</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col rounded-xl border border-border bg-surface-muted p-4 lg:col-span-3">
                                                <span className="mb-1 text-xs uppercase tracking-widest text-muted">Description</span>
                                                <span className="font-semibold text-foreground">
                                                    {org.organizer_profile?.organizer_details || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-8 border-t border-border pt-8">
                                            {selectedStatus === 'rejected' && (
                                                <div className="mb-6 rounded-[1.5rem] border border-danger/20 bg-danger/5 p-5">
                                                    <label className="mb-3 block text-sm font-black text-danger">
                                                        Rejection reason
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Explain why this organizer was rejected..."
                                                        className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-base font-medium text-foreground focus:border-primary focus:outline-none"
                                                        value={rejectionReason}
                                                        onChange={(event) => handleRejectionReasonChange(org.id, event.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                                <div className="min-w-[280px]">
                                                    <label
                                                        htmlFor={`status-select-${org.id}`}
                                                        className="mb-3 block text-sm font-black text-foreground"
                                                    >
                                                        Approval decision
                                                    </label>

                                                    <div className="group relative">
                                                        <select
                                                            id={`status-select-${org.id}`}
                                                            className="h-14 w-full appearance-none rounded-2xl border-2 border-border bg-surface px-5 pr-14 text-base font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                                                            value={selectedStatus}
                                                            onChange={(event) => handleStatusChange(org.id, event.target.value as ApprovalStatus)}
                                                        >
                                                            <option value="pending" disabled>
                                                                Select a decision
                                                            </option>
                                                            <option value="approved">Approve organizer</option>
                                                            <option value="rejected">Reject organizer</option>
                                                        </select>

                                                        <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-muted transition-colors group-hover:text-primary">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2.5}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    className="min-w-[260px] py-4 text-base"
                                                    disabled={isUpdating}
                                                    onClick={() => handleUpdateStatus(org.id, selectedStatus, rejectionReason)}
                                                >
                                                    {isUpdating ? 'Updating...' : 'Update Organizer Status'}
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminDashboard;