export interface AuthUser {
    id: string;
    email: string;
    role: 'buyer' | 'organizer' | 'admin';
    is_email_verified: boolean,
}