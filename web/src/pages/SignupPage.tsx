import { type ChangeEvent, type FormEvent, useState } from 'react';
import { FiBriefcase, FiGlobe, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';

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
};

function SignupPage() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<AccountType>('buyer');
    const [formData, setFormData] = useState<SignupFormData>(initialSignupFormData);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: checked,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            console.log('Passwords do not match');
            return;
        }

        const signupPayload = {
            accountType,
            ...formData,
        };

        console.log('Signup payload:', signupPayload);
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

                        {/* Account type switch */}
                        <div className="mb-8 grid grid-cols-2 gap-2 rounded-full border border-border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => setAccountType('buyer')}
                                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${accountType === 'buyer'
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                        : 'text-muted hover:text-primary'
                                    }`}
                            >
                                Buyer
                            </button>
                            <button
                                type="button"
                                onClick={() => setAccountType('organizer')}
                                className={`rounded-full px-4 py-2.5 text-sm font-black transition ${accountType === 'organizer'
                                        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                        : 'text-muted hover:text-primary'
                                    }`}
                            >
                                Organizer
                            </button>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-bold text-foreground">First name</span>
                                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                        <FiUser className="size-5 text-muted" />
                                        <input
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="Ahmed"
                                            autoComplete="given-name"
                                            required
                                            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-foreground">Last name</span>
                                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                        <FiUser className="size-5 text-muted" />
                                        <input
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Özdoğan"
                                            autoComplete="family-name"
                                            required
                                            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-sm font-bold text-foreground">Email address</span>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                    <FiMail className="size-5 text-muted" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                        className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-sm font-bold text-foreground">Phone number</span>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                    <FiPhone className="size-5 text-muted" />
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="+49 123 456789"
                                        autoComplete="tel"
                                        required
                                        className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                            </label>

                            {accountType === 'organizer' && (
                                <div className="space-y-5 rounded-[1.5rem] border border-secondary/40 bg-secondary/10 p-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="text-sm font-bold text-foreground">Company / organization name</span>
                                            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                                <FiBriefcase className="size-5 text-muted" />
                                                <input
                                                    name="companyName"
                                                    type="text"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    placeholder="TicketFlow Events GmbH"
                                                    autoComplete="organization"
                                                    required={accountType === 'organizer'}
                                                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </label>

                                        <label className="block">
                                            <span className="text-sm font-bold text-foreground">Website or social page</span>
                                            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                                <FiGlobe className="size-5 text-muted" />
                                                <input
                                                    name="website"
                                                    type="url"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com"
                                                    className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </label>
                                    </div>

                                    <label className="block">
                                        <span className="text-sm font-bold text-foreground">Organizer details</span>
                                        <textarea
                                            name="organizerDetails"
                                            rows={4}
                                            value={formData.organizerDetails}
                                            onChange={handleInputChange}
                                            placeholder="Tell us what kind of events you organize and why you want to use TicketFlow."
                                            required={accountType === 'organizer'}
                                            className="mt-2 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                                        />
                                    </label>

                                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm leading-6 text-muted">
                                        Organizer accounts are reviewed by admins before approval. After approval, you can create events,
                                        add ticket types, track sales, and manage attendee check-ins.
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-bold text-foreground">Password</span>
                                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                        <FiLock className="size-5 text-muted" />
                                        <input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Create password"
                                            autoComplete="new-password"
                                            required
                                            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-sm font-bold text-foreground">Confirm password</span>
                                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                        <FiLock className="size-5 text-muted" />
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Repeat password"
                                            autoComplete="new-password"
                                            required
                                            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </label>
                            </div>

                            <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-muted">
                                <input
                                    name="acceptedTerms"
                                    type="checkbox"
                                    checked={formData.acceptedTerms}
                                    onChange={handleCheckboxChange}
                                    required
                                    className="mt-1 size-4 accent-primary"
                                />
                                <span>I agree to the User Agreement, Terms of Service, and Privacy Policy.</span>
                            </label>

                            <Button fullWidth size="lg" type="submit">
                                {accountType === 'buyer' ? 'Create buyer account' : 'Apply as organizer'}
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
