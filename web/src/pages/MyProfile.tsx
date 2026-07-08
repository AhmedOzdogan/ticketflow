import { useEffect, useState } from 'react';
import { FiBriefcase, FiCalendar, FiCheckCircle, FiClock, FiEye, FiEyeOff, FiLock, FiPhone, FiShield, FiUser, FiXCircle } from 'react-icons/fi';
import { toast } from 'sonner';

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import AuthGate from '../pages/AuthGate';
import { Button } from '../components/ui/Button';
import { FormFields, type FieldValue, type FormField } from '../components/ui/Form';
import { useAuth } from '../context/AuthContext';
import type { OrganizerApprovalStatus, UserRole } from '../types/user';
import { changePassword, editProfile } from '../api/authApi';
import { getApiErrorMessage } from '../utils/getApiErrorMessages';

type ProfileFormData = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

type OrganizerFormData = {
    companyName: string;
    websiteUrl: string;
    organizerDetails: string;
};

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    showCurrentPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
};

const initialProfileFormData: ProfileFormData = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
};

const initialOrganizerFormData: OrganizerFormData = {
    companyName: '',
    websiteUrl: '',
    organizerDetails: '',
};

const initialPasswordFormData: PasswordFormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
};

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

function formatDate(value?: string | null) {
    if (!value) return 'Not available';

    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getStatusStyles(status: OrganizerApprovalStatus) {
    if (status === 'approved') return 'border-green-200 bg-green-50 text-green-700';
    if (status === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
    if (status === 'pending') return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    return 'border-border bg-background text-muted';
}

function getStatusIcon(status: OrganizerApprovalStatus) {
    if (status === 'approved') return <FiCheckCircle />;
    if (status === 'rejected') return <FiXCircle />;
    return <FiClock />;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-sm font-bold text-foreground">{label}</span>
            <div className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-muted">
                {value}
            </div>
        </div>
    );
}

function MyProfile() {
    const { user, accessToken } = useAuth();
    const [profileFormData, setProfileFormData] = useState<ProfileFormData>(initialProfileFormData);
    const [organizerFormData, setOrganizerFormData] = useState<OrganizerFormData>(initialOrganizerFormData);
    const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>(initialPasswordFormData);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        setProfileFormData({
            firstName: user.first_name ?? '',
            lastName: user.last_name ?? '',
            phoneNumber: user.phone_number ?? '',
        });

        setOrganizerFormData({
            companyName: user.organizer_profile?.company_name ?? '',
            websiteUrl: user.organizer_profile?.website_url ?? '',
            organizerDetails: user.organizer_profile?.organizer_details ?? '',
        });
    }, [user]);

    const profileFields: FormField<ProfileFormData>[] = [
        {
            name: 'firstName',
            label: 'First name',
            type: 'text',
            placeholder: 'First name',
            autoComplete: 'given-name',
            required: true,
            icon: <FiUser />,
        },
        {
            name: 'lastName',
            label: 'Last name',
            type: 'text',
            placeholder: 'Last name',
            autoComplete: 'family-name',
            required: true,
            icon: <FiUser />,
        },
        {
            name: 'phoneNumber',
            label: 'Phone number',
            type: 'tel',
            placeholder: '+49 123 456789',
            autoComplete: 'tel',
            icon: <FiPhone />,
            containerClassName: 'md:col-span-2',
        },
    ];

    const organizerFields: FormField<OrganizerFormData>[] = [
        {
            name: 'companyName',
            label: 'Company / organization name',
            type: 'text',
            placeholder: 'TicketFlow Events GmbH',
            required: true,
            icon: <FiBriefcase />,
        },
        {
            name: 'websiteUrl',
            label: 'Website or social page',
            type: 'text',
            placeholder: 'example.com or https://example.com',
            icon: <FiBriefcase />,
        },
        {
            name: 'organizerDetails',
            label: 'Organizer description',
            type: 'textarea',
            placeholder: 'Tell visitors what kind of events your organization creates.',
            rows: 4,
            required: true,
            containerClassName: 'md:col-span-2',
        },
    ];

    const passwordFields: FormField<PasswordFormData>[] = [
        {
            name: 'currentPassword',
            label: 'Current password',
            type: passwordFormData.showCurrentPassword ? 'text' : 'password',
            placeholder: 'Current password',
            autoComplete: 'current-password',
            required: true,
            icon: <FiLock />,
            rightIcon: passwordFormData.showCurrentPassword ? <FiEyeOff /> : <FiEye />,
            onRightIconClick: () =>
                setPasswordFormData((current) => ({
                    ...current,
                    showCurrentPassword: !current.showCurrentPassword,
                })),
            containerClassName: 'md:col-span-2',
        },
        {
            name: 'newPassword',
            label: 'New password',
            type: passwordFormData.showNewPassword ? 'text' : 'password',
            placeholder: 'New password',
            autoComplete: 'new-password',
            required: true,
            icon: <FiLock />,
            rightIcon: passwordFormData.showNewPassword ? <FiEyeOff /> : <FiEye />,
            onRightIconClick: () =>
                setPasswordFormData((current) => ({
                    ...current,
                    showNewPassword: !current.showNewPassword,
                })),
        },
        {
            name: 'confirmPassword',
            label: 'Confirm new password',
            type: passwordFormData.showConfirmPassword ? 'text' : 'password',
            placeholder: 'Repeat new password',
            autoComplete: 'new-password',
            required: true,
            icon: <FiLock />,
            rightIcon: passwordFormData.showConfirmPassword ? <FiEyeOff /> : <FiEye />,
            onRightIconClick: () =>
                setPasswordFormData((current) => ({
                    ...current,
                    showConfirmPassword: !current.showConfirmPassword,
                })),

        },
    ];

    const handleProfileFieldChange = (name: keyof ProfileFormData, value: FieldValue) => {
        setProfileFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleOrganizerFieldChange = (name: keyof OrganizerFormData, value: FieldValue) => {
        setOrganizerFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handlePasswordFieldChange = (name: keyof PasswordFormData, value: FieldValue) => {
        setPasswordFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSaveProfile = async () => {
        setProfileLoading(true);

        if (!accessToken) {
            toast.error('Access token is missing. Please log in again.');
            setProfileLoading(false);
            return;
        }

        if (profileFormData.firstName.trim() === '' || profileFormData.lastName.trim() === '' || profileFormData.phoneNumber.trim() === '') {
            toast.error('First name, last name, and phone number cannot be empty.');
            setProfileLoading(false);
            return;
        }

        try {
            await editProfile(
                {
                    first_name: profileFormData.firstName,
                    last_name: profileFormData.lastName,
                    phone_number: profileFormData.phoneNumber,
                },
                accessToken!,
            )

            toast.success('Profile information updated successfully.');
        } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            toast.error(apiMessage);
            console.error('Profile update failed:', error);
        } finally {
            setProfileLoading(false);
        }
    };


    const handleChangePassword = async () => {
        if (
            passwordFormData.newPassword !==
            passwordFormData.confirmPassword
        ) {
            toast.error(
                'Passwords do not match.'
            );
            return;
        }

        setPasswordLoading(true);

        try {
            await changePassword(
                {
                    old_password:
                        passwordFormData.currentPassword,
                    new_password:
                        passwordFormData.newPassword,
                    confirm_password:
                        passwordFormData.confirmPassword,
                },
                accessToken!,
            );

            toast.success(
                'Password updated successfully.'
            );

            setPasswordFormData(
                initialPasswordFormData
            );
        } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            toast.error(apiMessage);
            console.error('Password change failed:', error);
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) {
        return (
            <AuthGate />
        );
    }

    const organizerStatus = user.organizer_approval_status;
    const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="relative flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_28%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_26%)] opacity-20" />

                <div className="mx-auto max-w-7xl space-y-8">
                    <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-wide text-primary">My Profile</p>
                                <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">{fullName}</h1>
                                <p className="mt-2 text-sm font-semibold text-muted">Manage your TicketFlow account details and security.</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                                    <FiShield />
                                    {roleLabels[user.role]}
                                </span>
                                {user.role === 'organizer' && (
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${getStatusStyles(organizerStatus)}`}>
                                        {getStatusIcon(organizerStatus)}
                                        {statusLabels[organizerStatus]}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="grid auto-rows-min gap-8 lg:grid-cols-2">
                        <section className="flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <FiUser />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground">Personal Information</h2>
                                    <p className="text-sm font-semibold text-muted">Update your basic account details.</p>
                                </div>
                            </div>

                            <FormFields
                                fields={profileFields}
                                values={profileFormData}
                                onChange={handleProfileFieldChange}
                                disabled={profileLoading}
                                className="grid gap-5 md:grid-cols-2"
                            />

                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <ReadOnlyField label="Email address" value={user.email} />
                                <ReadOnlyField label="Account role" value={roleLabels[user.role]} />
                            </div>

                            <div className="mt-auto flex justify-end pt-8">
                                <Button onClick={handleSaveProfile} disabled={profileLoading}>
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </section>

                        <section className="flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <FiLock />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground">Security</h2>
                                    <p className="text-sm font-semibold text-muted">Change your account password.</p>
                                </div>
                            </div>

                            <FormFields
                                fields={passwordFields}
                                values={passwordFormData}
                                onChange={handlePasswordFieldChange}
                                disabled={passwordLoading}
                                className="grid gap-5"
                            />

                            <div className="mt-7 rounded-2xl border border-border bg-background p-4">
                                <p className="text-sm font-medium leading-6 text-muted">
                                    For security, enter your current password before choosing a new one. If you've forgotten your password, sign out and use the <span className="font-semibold text-foreground">Forgot Password</span> option on the login page to reset it.
                                </p>
                            </div>

                            <div className="mt-auto flex justify-end pt-8">
                                <Button onClick={handleChangePassword} disabled={passwordLoading}>
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </div>
                        </section>

                        {user.role === 'organizer' && (
                            <section className="flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8">
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                                            <FiBriefcase />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-foreground">Organizer Information</h2>
                                            <p className="text-sm font-semibold text-muted">Manage the public details of your organizer profile.</p>
                                        </div>
                                    </div>

                                    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${getStatusStyles(organizerStatus)}`}>
                                        {getStatusIcon(organizerStatus)}
                                        {statusLabels[organizerStatus]}
                                    </span>
                                </div>

                                {organizerStatus === 'rejected' && user.organizer_profile?.rejection_reason && (
                                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                                        <strong>Rejection reason:</strong> {user.organizer_profile.rejection_reason}
                                    </div>
                                )}

                                {organizerStatus === 'pending' && (
                                    <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold leading-6 text-yellow-800">
                                        Your organizer account is waiting for admin review. <span className="font-bold text-brand-rose">If you want to make changes to your organizer profile, please contact support or wait for the review to complete.</span>
                                    </div>
                                )}

                                <FormFields
                                    fields={organizerFields}
                                    values={organizerFormData}
                                    onChange={handleOrganizerFieldChange}
                                    disabled={true}
                                    className="grid gap-5 md:grid-cols-2"
                                />

                            </section>
                        )}

                        <section className="flex h-full flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-xl shadow-brand-black/5 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                                    <FiCalendar />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground">Account Information</h2>
                                    <p className="text-sm font-semibold text-muted">Read-only account metadata.</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <ReadOnlyField label="Email verified" value={user.is_email_verified ? 'Yes' : 'No'} />
                                <ReadOnlyField label="Member since" value={formatDate(user.created_at)} />
                                <ReadOnlyField label="Last updated" value={formatDate(user.updated_at)} />
                            </div>
                            {user.is_email_verified ? (
                                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-4">
                                    <p className="text-sm font-medium leading-6 text-green-700">
                                        Your email address has been <span className="font-semibold">successfully verified</span>. Your account is fully secured and you can access all TicketFlow features.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-7 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="text-sm font-medium leading-6 text-yellow-800">
                                        Your email address has not been verified yet. Please check your inbox for the verification email. If you can't find it, check your spam folder or request a new verification email from the login page.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default MyProfile;
