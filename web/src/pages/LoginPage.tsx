import { type ChangeEvent, type FormEvent, useState } from 'react';
import { FiLock, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';

type AccountType = 'buyer' | 'organizer';

type LoginFormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

const initialLoginFormData: LoginFormData = {
    email: '',
    password: '',
    rememberMe: false,
};

function LoginPage() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState<AccountType>('buyer');
    const [formData, setFormData] = useState<LoginFormData>(initialLoginFormData);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const loginPayload = {
            accountType,
            ...formData,
        };

        console.log('Login payload:', loginPayload);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                <section className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="hidden overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-2xl shadow-brand-black/10 lg:block">
                        <img
                            src="/images/theater.webp"
                            alt="Event venue with audience seats"
                            className="h-[620px] w-full rounded-[1.5rem] object-cover"
                        />
                    </div>

                    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8">
                        <div className="mb-8">
                            <p className="text-sm font-black uppercase tracking-wide text-primary">Welcome back</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Log in to TicketFlow</h1>
                            <p className="mt-3 text-sm leading-6 text-muted">
                                Access your tickets, manage your events, or continue setting up your organizer dashboard.
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
                                <span className="text-sm font-bold text-foreground">Password</span>
                                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary">
                                    <FiLock className="size-5 text-muted" />
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                        className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                            </label>

                            {accountType === 'organizer' && (
                                <div className="rounded-2xl border border-secondary/40 bg-secondary/15 p-4 text-sm leading-6 text-muted">
                                    Organizer accounts can access event creation, ticket sales, attendee lists, and check-in tools after approval.
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 text-sm">
                                <label className="flex items-center gap-2 font-semibold text-muted">
                                    <input
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                        className="size-4 accent-primary"
                                    />
                                    Remember me
                                </label>
                                <button type="button" className="font-bold text-primary transition hover:text-accent">
                                    Forgot password?
                                </button>
                            </div>

                            <Button fullWidth size="lg" type="submit">
                                Log in as {accountType === 'buyer' ? 'buyer' : 'organizer'}
                            </Button>
                        </form>

                        <div className="mt-8 border-t border-border pt-6 text-center text-sm font-semibold text-muted">
                            Don&apos;t have an account?{' '}
                            <button type="button" onClick={() => navigate('/signup')} className="font-black text-primary hover:text-accent">
                                Create one
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default LoginPage;
