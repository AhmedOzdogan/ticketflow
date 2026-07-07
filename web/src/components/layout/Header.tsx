import { useNavigate } from 'react-router-dom';
import logo256 from '/logo_256.png';
import { Button, ThemeToggle } from '../ui/Button';
import { AuthButtons } from '../ui/AuthButtons';

const navigationLinks = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
];

export function Header() {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                {/* Brand logo and name */}
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 text-left"
                    aria-label="TicketFlow home"
                >
                    <img src={logo256} alt="TicketFlow logo" className="size-10 rounded-xl object-contain" />
                    <div className="leading-tight">
                        <p className="text-lg font-bold tracking-tight text-foreground">TicketFlow</p>
                        <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                            Events. Tickets. Check-ins.
                        </p>
                    </div>
                </button>

                {/* Main navigation */}
                <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
                    {navigationLinks.map((link) => (
                        <button
                            key={link.path}
                            type="button"
                            onClick={() => navigate(link.path)}
                            className="transition hover:text-primary"
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Auth actions and theme toggle */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <AuthButtons />
                </div>
            </div>
        </header>
    );
}