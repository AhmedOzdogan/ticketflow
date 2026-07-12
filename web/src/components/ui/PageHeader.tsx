import {
    FiCheckCircle,
    FiClock,
    FiShield,
    FiXCircle,
} from 'react-icons/fi';

import type {
    OrganizerApprovalStatus,
    UserRole,
} from '../../types/user';

const roleLabels: Record<UserRole, string> = {
    buyer: 'Buyer',
    organizer: 'Organizer',
    admin: 'Admin',
};

const statusLabels: Record<OrganizerApprovalStatus, string> = {
    not_applicable: 'Not applicable',
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
};

export interface PageHeaderProps {
    title: string;
    description: string;
    role?: UserRole;
    organizerStatus?: OrganizerApprovalStatus;
}

function getStatusIcon(status: OrganizerApprovalStatus) {
    if (status === 'approved') return <FiCheckCircle />;
    if (status === 'rejected') return <FiXCircle />;
    return <FiClock />;
}

function getStatusStyles(status: OrganizerApprovalStatus) {
    if (status === 'approved') return 'border-green-200 bg-green-50 text-green-700';
    if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
    if (status === 'pending') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    return 'border-border bg-background text-muted';
}

export function PageHeader({
    title,
    description,
    role,
    organizerStatus,
}: PageHeaderProps) {
    return (
        <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xl font-black uppercase tracking-wide text-primary">
                        {title}
                    </p>

                    <p className="mt-2 text-md font-bold text-muted ">
                        {description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {role && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                            <FiShield />
                            {roleLabels[role]}
                        </span>
                    )}

                    {role === 'organizer' && organizerStatus && (
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${getStatusStyles(
                                organizerStatus,
                            )}`}
                        >
                            {getStatusIcon(organizerStatus)}
                            {statusLabels[organizerStatus]}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}