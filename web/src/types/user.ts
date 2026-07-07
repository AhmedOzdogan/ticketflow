export type UserRole = 'buyer' | 'organizer' | 'admin';

export type OrganizerApprovalStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'not_applicable';

export interface OrganizerProfile {
    company_name: string;
    website_url: string;
    organizer_details: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
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