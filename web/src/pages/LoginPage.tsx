import { useState, type SyntheticEvent } from 'react';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { FormFields, type FieldValue, type FormField } from '../components/ui/Form';
import { LoginButtons } from '../components/ui/LoginButtons';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/getApiErrorMessages';
import { toast } from 'sonner';

type LoginFormData = {
    email: string;
    password: string;
    showPassword: boolean;
    rememberMe: boolean;
};

const initialLoginFormData: LoginFormData = {
    email: '',
    password: '',
    showPassword: false,
    rememberMe: true,
};

function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>(initialLoginFormData);

    // State for error messages and loading state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const loginFields: FormField<LoginFormData>[] = [
        {
            name: 'email',
            label: 'Email address',
            type: 'email',
            placeholder: 'you@example.com',
            autoComplete: 'email',
            required: true,
            icon: <FiMail />,
        },
        {
            name: 'password',
            label: 'Password',
            type: formData.showPassword ? 'text' : 'password',
            placeholder: 'Enter your password',
            autoComplete: 'current-password',
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
            name: 'rememberMe',
            label: 'Remember me',
            type: 'checkbox',
        },
    ];


    const { loginUser } = useAuth();
    const handleFieldChange = (name: keyof LoginFormData, value: FieldValue) => {
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
        // Reset error message and set loading state
        setErrorMessage(null);
        setLoading(true);
        try {
            await loginUser(
                {
                    email: formData.email,
                    password: formData.password,
                },
                formData.rememberMe,
            );

            toast.success('Welcome back! You are now signed in.');
            navigate('/');
        } catch (error) {
            const apiMessage = getApiErrorMessage(error);
            setErrorMessage(apiMessage);
            toast.error(apiMessage)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                <section className="mx-auto grid max-w-[82rem] items-stretch gap-10 lg:grid-cols-[1fr_600px]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 h-full overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-2xl shadow-brand-black/10">
                            <img
                                src="/images/theater.webp"
                                alt="Event venue with audience seats"
                                className="h-full min-h-[900px] w-full rounded-[1.5rem] object-cover"
                            />
                        </div>
                    </aside>

                    <div className="mx-auto flex min-h-[900px] w-full max-w-[600px] flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-2xl shadow-brand-black/10 sm:p-8 lg:p-10">
                        <div>
                            <p className="text-sm font-black uppercase tracking-wide text-primary">Welcome back</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Log in to TicketFlow</h1>
                            <p className="mt-3 text-sm leading-6 text-muted">
                                Access your tickets, manage your events, or continue setting up your organizer dashboard.
                            </p>

                            <div className="mt-7">
                                <LoginButtons />
                            </div>

                            <div className="my-7 flex items-center gap-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                                    Or continue with email
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        </div>


                        <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} method="POST">
                            <div className="space-y-5">
                                <FormFields fields={loginFields} values={formData} onChange={handleFieldChange} />


                                <div className="flex justify-end text-sm">
                                    <button type="button" className="font-bold text-primary transition hover:text-accent">
                                        Forgot password?
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto pt-2">
                                <Button fullWidth size="lg" type="submit" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Log in'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-7 border-t border-border pt-6 text-center text-sm font-semibold text-muted">
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