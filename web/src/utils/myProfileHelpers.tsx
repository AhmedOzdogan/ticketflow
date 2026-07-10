import type { OrganizerApprovalStatus } from '../types/user';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

export function formatDate(value?: string | null) {
    if (!value) return 'Not available';

    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getStatusStyles(status: OrganizerApprovalStatus) {
    if (status === 'approved') return 'border-green-200 bg-green-50 text-green-700';
    if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
    if (status === 'pending') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    return 'border-border bg-background text-muted';
}

export function getStatusIcon(status: OrganizerApprovalStatus) {
    if (status === 'approved') return <FiCheckCircle />;
    if (status === 'rejected') return <FiXCircle />;
    return <FiClock />;
}