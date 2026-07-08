import { useState, type SyntheticEvent } from 'react';
import { FiBriefcase, FiGlobe, FiLock, FiMail, FiPhone, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import RegisterRequest type from the same module as registerUser
import type { RegisterRequest } from '../types/auth';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { AccountSwitch } from '../components/ui/AccountSwitch';
import { Button } from '../components/ui/Button';
import { FormFields, type FieldValue, type FormField } from '../components/ui/Form';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../utils/getApiErrorMessages';

type AccountType = 'buyer' | 'organizer';

type SignupFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    website: string;
    organizerDetails: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
    rememberMe: boolean;
    showPassword: boolean;
    showConfirmPassword: boolean;
};

const initialSignupFormData: SignupFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    website: '',
    organizerDetails: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    rememberMe: false,
    showPassword: false,
    showConfirmPassword: false,
};

const baseSignupFields: FormField<SignupFormData>[] = [
    {
        name: 'firstName',
        label: 'First name',
        type: 'text',
        placeholder: 'Ahmed',
        autoComplete: 'given-name',
        required: true,
        icon: <FiUser />,
        containerClassName: 'sm:col-span-1',
    },
    {
        name: 'lastName',
        label: 'Last name',
        type: 'text',
        placeholder: 'Özdoğan',
        autoComplete: 'family-name',
        required: true,
        icon: <FiUser />,
        containerClassName: 'sm:col-span-1',
    },
    {
        name: 'email',
        label: 'Email address',
        type: 'email',
        placeholder: 'you@example.com',
        autoComplete: 'email',
        required: true,
        icon: <FiMail />,
        containerClassName: 'sm:col-span-2',
    },
    {
        name: 'phoneNumber',
        label: 'Phone number',
        type: 'tel',
        placeholder: '+49 123 456789',
        autoComplete: 'tel',
        required: true,
        icon: <FiPhone />,
        containerClassName: 'sm:col-span-2',
    },
];

const organizerSignupFields: FormField<SignupFormData>[] = [
    {
        name: 'companyName',
        label: 'Company / organization name',
        type: 'text',
        placeholder: 'TicketFlow Events GmbH',
        autoComplete: 'organization',
        required: true,
        icon: <FiBriefcase />,
        containerClassName: 'sm:col-span-1',
    },
    {
        name: 'website',
        label: 'Website or social page',
        type: 'text',
        required: true,
        placeholder: 'https://example.com or www.example.com',
        icon: <FiGlobe />,
        containerClassName: 'sm:col-span-1',
    },
    {
        name: 'organizerDetails',
        label: 'Organizer details',
        type: 'textarea',
        placeholder: 'Tell us what kind of events you organize and why you want to use TicketFlow.',
        required: true,
        rows: 4,
        containerClassName: 'sm:col-span-2',
    },
];

function SignupPage() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<AccountType>('buyer');
    const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData);
    const { registerUser } = useAuth();

    const normalizeWebsiteUrl = (website: string) => {
        const trimmedWebsite = website.trim();

        if (!trimmedWebsite) {
            return undefined;
        }

        return /^https?:\/\//i.test(trimmedWebsite)
            ? trimmedWebsite
            : `https://${trimmedWebsite}`;
    };

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const passwordSignupFields: FormField<SignupFormData>[] = [
        {
            name: 'password',
            label: 'Password',
            type: formData.showPassword ? 'text' : 'password',
            placeholder: 'Create password',
            autoComplete: 'new-password',
            required: true,
            icon: <FiLock />,
            rightIcon: formData.showPassword ? <FiEyeOff /> : <FiEye />,
            onRightIconClick: () =>
                setFormData(prev => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                })),
            containerClassName: 'sm:col-span-1',
        },
        {
            name: 'confirmPassword',
            label: 'Confirm password',
            type: formData.showConfirmPassword ? 'text' : 'password',
            placeholder: 'Repeat password',
            autoComplete: 'new-password',
            required: true,
            icon: <FiLock />,
            rightIcon: formData.showConfirmPassword ? <FiEyeOff /> : <FiEye />,
            onRightIconClick: () =>
                setFormData(prev => ({
                    ...prev,
                    showConfirmPassword: !prev.showConfirmPassword,
                })),
            containerClassName: 'sm:col-span-1',
        },
        {
            name: 'acceptedTerms',
            label: 'I agree to the User Agreement, Terms of Service, and Privacy Policy.',
            type: 'checkbox',
            required: true,
            containerClassName: 'sm:col-span-2',
        },
        {
            name: 'rememberMe',
            label: 'Remember me',
            type: 'checkbox',
        },
    ];

    const handleFieldChange = (name: keyof SignupFormData, value: FieldValue) => {
        if (errorMessage) {
            setErrorMessage(null);
        }
        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value,
        }));
    };


    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        if (loading) {
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        if (formData.password !== formData.confirmPassword) {
            toast.warning('Passwords do not match');
            setErrorMessage('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!formData.acceptedTerms) {
            toast.warning('You must accept the terms and conditions');
            setErrorMessage('You must accept the terms and conditions');
            setLoading(false);
            return;
        }

        const normalizedWebsite = accountType === 'organizer'
            ? normalizeWebsiteUrl(formData.website)
            : undefined;

        const registerPayload: RegisterRequest = {
            email: formData.email.trim(),
            password: formData.password,
            confirm_password: formData.confirmPassword,
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone_number: formData.phoneNumber.trim(),
            role: accountType === 'buyer' ? 'buyer' : 'organizer',
            company_name: accountType === 'organizer' ? formData.companyName.trim() : undefined,
            website_url: normalizedWebsite,
            organizer_details: accountType === 'organizer' ? formData.organizerDetails.trim() : undefined,
        };

        try {
            await registerUser(registerPayload, formData.rememberMe);

            toast.success(
                accountType === 'buyer'
                    ? 'Welcome to TicketFlow! Your account has been created successfully.'
                    : "Your organizer application has been submitted. We'll review it and notify you once approved.",
            );
            navigate('/');
        } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            setErrorMessage(apiMessage);
            toast.error(apiMessage);
            console.error('Signup failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                <section className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8">
                        <div className="mb-8">
                            <p className="text-sm font-black uppercase tracking-wide text-primary">Create your account</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Join TicketFlow</h1>
                            <p className="mt-3 text-sm leading-6 text-muted">
                                Sign up as a buyer to purchase tickets, or apply as an organizer to create and manage events.
                            </p>
                        </div>

                        <AccountSwitch accountType={accountType} setAccountType={setAccountType} />

                        <form className="space-y-5" onSubmit={handleSubmit} method="POST">
                            <FormFields
                                fields={baseSignupFields}
                                values={formData}
                                onChange={handleFieldChange}
                                disabled={loading}
                                className="grid gap-5 sm:grid-cols-2"
                            />

                            {accountType === 'organizer' && (
                                <div className="space-y-5 rounded-[1.5rem] border border-secondary/40 bg-secondary/10 p-5">
                                    <FormFields
                                        fields={organizerSignupFields}
                                        values={formData}
                                        onChange={handleFieldChange}
                                        disabled={loading}
                                        className="grid gap-5 sm:grid-cols-2"
                                    />

                                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-muted">
                                        Organizer accounts are reviewed by admins before approval. After approval, you can create events,
                                        add ticket types, track sales, and manage attendee check-ins.
                                    </div>
                                </div>
                            )}

                            <FormFields
                                fields={passwordSignupFields}
                                values={formData}
                                onChange={handleFieldChange}
                                disabled={loading}
                                className="grid gap-5 sm:grid-cols-2"
                            />

                            <Button fullWidth size="lg" type="submit" disabled={loading}>
                                {loading ? 'Creating account...' : accountType === 'buyer' ? 'Create buyer account' : 'Apply as organizer'}
                            </Button>
                        </form>

                        <div className="mt-8 border-t border-border pt-6 text-center text-sm font-semibold text-muted">
                            Already have an account?{' '}
                            <button type="button" onClick={() => navigate('/login')} className="font-black text-primary hover:text-accent">
                                Log in
                            </button>
                        </div>
                    </div>

                    <aside className="hidden lg:block">
                        <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-2xl shadow-brand-black/10">
                            <img
                                src="/images/event.webp"
                                alt="Professional conference audience"
                                className="h-[760px] w-full rounded-[1.5rem] object-cover"
                            />
                        </div>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default SignupPage;