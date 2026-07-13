export type UserRole = 'buyer' | 'organizer' | 'admin';

export type OrganizerApprovalStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'not_applicable';

export interface OrganizerStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface UserStats {
    total: number;
    buyers: number;
    admins: number;
    organizers: OrganizerStats;
}

export interface OrganizerProfile {
    company_name: string;
    website_url: string;
    organizer_details: string;
    reviewed_at: string | null;
    rejection_reason: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: UserRole;
    is_email_verified: boolean;
    organizer_approval_status: OrganizerApprovalStatus;
    profile_image_url: string;
    organizer_profile: OrganizerProfile | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    stats: UserStats;
    results: T[];
}

export interface OrganizerStatusState {
    organizer_approval_status: OrganizerApprovalStatus;
    rejectionReason: string;
}