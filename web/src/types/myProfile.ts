export type ProfileFormData = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

export type OrganizerFormData = {
    companyName: string;
    websiteUrl: string;
    organizerDetails: string;
};

export type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    showCurrentPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
};