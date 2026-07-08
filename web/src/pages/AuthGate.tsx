

import { FiArrowLeft, FiHome, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';

type AuthGateVariant = 'login' | 'unauthorized';

interface AuthGateProps {
    variant?: AuthGateVariant;
    title?: string;
    message?: string;
}

export default function AuthGate({
    variant = 'login',
    title,
    message,
}: AuthGateProps) {
    const navigate = useNavigate();

    const isLoginGate = variant === 'login';

    const defaultTitle = isLoginGate ? 'Sign in to continue' : 'Access restricted';
    const defaultMessage = isLoginGate
        ? 'You need an account to view this page and continue using TicketFlow.'
        : "This page doesn't exist or you do not have permission to view it.";

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Header />

            <main className="relative flex flex-1 items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--brand-yellow),transparent_30%),radial-gradient(circle_at_top_right,var(--brand-rose),transparent_28%)] opacity-20" />

                <section className="mx-auto flex max-w-5xl flex-col items-center text-center">

                    <div className="relative mb-8 flex h-36 w-36 items-center justify-center rounded-[2rem] border border-border bg-surface shadow-2xl shadow-brand-black/10">
                        <div className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            {isLoginGate ? <FiLogIn size={26} /> : <FiLock size={26} />}
                        </div>
                        <FiLock className="text-primary" size={64} />
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        {title || defaultTitle}
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                        {message || defaultMessage}
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        {isLoginGate ? (
                            <>
                                <Button size="lg" onClick={() => navigate('/login')}>
                                    <FiLogIn className="mr-2" />
                                    Login
                                </Button>

                                <Button variant="outline" size="lg" onClick={() => navigate('/signup')}>
                                    <FiUserPlus className="mr-2" />
                                    Create Account
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="lg" onClick={() => navigate('/')}>
                                    <FiHome className="mr-2" />
                                    Back to Home
                                </Button>

                                <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
                                    <FiArrowLeft className="mr-2" />
                                    Go Back
                                </Button>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}