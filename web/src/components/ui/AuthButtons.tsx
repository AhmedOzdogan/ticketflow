import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiGrid, FiHelpCircle, FiLogOut, FiSettings, FiShield, FiUser } from 'react-icons/fi';
import { TfiTicket } from "react-icons/tfi";
import { BsQrCodeScan } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

type MenuItem = {
    label: string;
    path: string;
    icon: React.ReactNode;
};

export function AuthButtons() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logoutUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-full sm:border sm:border-border sm:bg-surface  sm:shadow-sm">
                <Button
                    variant="outline"
                    size="sm"
                    className="size-15 p-0 sm:h-10 sm:w-auto sm:rounded-l-full sm:rounded-r-none sm:border-0 sm:bg-transparent sm:px-5 sm:py-2 sm:shadow-none sm:ring-0"
                    onClick={() => navigate('/login')}
                    aria-label="Login"
                    title="Login"
                >
                    <FiUser className="size-6 sm:hidden" />
                    <span className="hidden sm:inline">Login</span>
                </Button>

                <span className="hidden h-10 w-[2px] bg-brand-black sm:block" aria-hidden="true" />

                <Button
                    variant="primary"
                    size="sm"
                    className="size-15 p-0 sm:h-10 sm:w-auto sm:rounded-l-none sm:rounded-r-full  sm:px-5 sm:py-2 sm:shadow-none sm:ring-0"
                    onClick={() => navigate('/signup')}
                    aria-label="Sign up"
                    title="Sign up"
                >
                    <FiLogOut className="size-6 rotate-180 sm:hidden" />
                    <span className="hidden sm:inline">Sign up</span>
                </Button>
            </div>
        );
    }

    const displayName = user.first_name || user.email.split('@')[0] || 'Account';

    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const roleMenuItems: MenuItem[] = [];

    if (user.role === 'buyer') {
        roleMenuItems.push(
            { label: 'My Orders', path: '/my-orders', icon: <TfiTicket /> },
        );
    }

    if (user.role === 'organizer') {
        roleMenuItems.push(
            { label: 'Dashboard', path: '/organizer/dashboard', icon: <FiGrid /> },
            { label: 'My Events', path: '/organizer/my-events', icon: <TfiTicket /> },
            { label: 'Create Event', path: '/organizer/create-event', icon: <TfiTicket /> },
            { label: 'Scan QR', path: '/organizer/scan', icon: <BsQrCodeScan /> }
        );
    }

    if (user.role === 'admin') {
        roleMenuItems.push({ label: 'Admin Dashboard', path: '/admin-dashboard', icon: <FiShield /> });
    }

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        setIsOpen(false);
        logoutUser();
        navigate('/');
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((currentValue) => !currentValue)}
                className="flex min-h-[60px] min-w-[6rem] items-center justify-center gap-3 rounded-full border border-border bg-surface p-0 text-base font-bold text-foreground shadow-md transition hover:border-primary hover:text-primary sm:px-4 sm:py-2.5"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                </span>

                <span className="hidden max-w-32 truncate sm:block">
                    {displayName}
                </span>

                <FiChevronDown
                    className={`size-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (

                <div className="absolute right-0 mt-4 w-[95dvw] sm:w-72 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-brand-black/15">
                    <div className="border-b border-border p-5 sm:p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-14 sm:size-11 items-center justify-center rounded-2xl bg-primary text-xl sm:text-lg font-black text-primary-foreground">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-lg sm:text-sm font-black text-foreground">
                                    {displayName}
                                </p>
                                <p className="truncate text-lg sm:text-xs font-semibold text-muted-foreground">
                                    {user.email}
                                </p>
                                {roleLabel !== 'Buyer' && (
                                    <div className="truncate text-lg sm:text-xs font-semibold text-brand-rose">
                                        {roleLabel}
                                    </div>
                                )}
                            </div>
                        </div>


                        {user.organizer_approval_status === 'pending' && (
                            <div className="mt-4 sm:mt-3 inline-flex rounded-2xl bg-warning/80 px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs font-black uppercase tracking-wide text-black">
                                Your account is pending approval. This may limit your access to certain features until approved.
                            </div>
                        )}
                        {user.organizer_approval_status === 'rejected' && (
                            <div className="mt-4 sm:mt-3 inline-flex rounded-2xl bg-danger px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs font-black uppercase tracking-wide text-black">
                                Your account has been rejected. Please contact support for further assistance.
                            </div>
                        )}
                    </div>


                    <div className="p-2">
                        <button
                            type="button"
                            onClick={() => handleNavigate('/my-profile')}
                            className="flex w-full items-center gap-4 sm:gap-3 rounded-2xl px-4 py-4 sm:px-3 sm:py-2.5 text-left text-2xl sm:text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiUser className="size-8 sm:size-4" />
                            My Profile
                        </button>

                        {roleMenuItems.map((item) => (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() => handleNavigate(item.path)}
                                className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-2xl font-bold text-foreground transition hover:bg-background hover:text-primary sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center sm:size-4 [&>svg]:size-8 sm:[&>svg]:size-4">
                                    {item.icon}
                                </span>

                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-border p-2">
                        <button
                            type="button"
                            onClick={() => handleNavigate('/feature-preview')}
                            className="flex w-full items-center gap-4 sm:gap-3 rounded-2xl px-4 py-4 sm:px-3 sm:py-2.5 text-left text-base sm:text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiSettings className="size-8 sm:size-4" />
                            Settings
                        </button>

                        <button
                            type="button"
                            onClick={() => handleNavigate('/feature-preview')}
                            className="flex w-full items-center gap-4 sm:gap-3 rounded-2xl px-4 py-4 sm:px-3 sm:py-2.5 text-left text-base sm:text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiHelpCircle className="size-8 sm:size-4" />
                            Support
                        </button>
                    </div>

                    <div className="border-t border-border p-2">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-black text-danger transition hover:bg-danger/10"
                        >
                            <FiLogOut className="size-8 sm:size-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}