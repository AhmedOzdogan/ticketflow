

import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiGrid, FiHelpCircle, FiLogOut, FiSettings, FiShield, FiUser } from 'react-icons/fi';
import { TfiTicket } from "react-icons/tfi";
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
            <>
                <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => navigate('/login')}
                >
                    Login
                </Button>

                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                    Sign up
                </Button>
            </>
        );
    }

    const displayName = user.first_name || user.email.split('@')[0] || 'Account';

    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const roleMenuItems: MenuItem[] = [];

    if (user.role === 'buyer') {
        roleMenuItems.push(
            { label: 'My Tickets', path: '/my-tickets', icon: <TfiTicket /> },
            { label: 'My Events', path: '/my-events', icon: <FiGrid /> },
        );
    }

    if (user.role === 'organizer') {
        roleMenuItems.push(
            { label: 'Dashboard', path: '/organizer/dashboard', icon: <FiGrid /> },
            { label: 'My Events', path: '/organizer/events', icon: <TfiTicket /> },
        );
    }

    if (user.role === 'admin') {
        roleMenuItems.push({ label: 'Admin Dashboard', path: '/admin', icon: <FiShield /> });
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
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:block">{displayName}</span>
                <FiChevronDown className={`size-4 transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-brand-black/15">
                    <div className="border-b border-border p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-foreground">{displayName}</p>
                                <p className="truncate text-xs font-semibold text-muted-foreground">{user.email}</p>
                                {roleLabel !== 'Buyer' && (
                                    <div className="truncate text-xs font-semibold text-brand-rose">
                                        {roleLabel}
                                    </div>
                                )}
                            </div>
                        </div>


                        {user.organizer_approval_status === 'pending' && (
                            <div className="mt-3 inline-flex rounded-2xl  bg-warning/80 px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                                Your account is pending approval. This may limit your access to certain features until approved.
                            </div>
                        )}
                        {user.organizer_approval_status === 'rejected' && (
                            <div className="mt-3 inline-flex rounded-2xl  bg-danger px-3 py-1 text-xs font-black uppercase tracking-wide text-black">
                                Your account has been rejected. Please contact support for further assistance.
                            </div>
                        )}
                    </div>


                    <div className="p-2">
                        <button
                            type="button"
                            onClick={() => handleNavigate('/my-profile')}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiUser className="size-4" />
                            My Profile
                        </button>

                        {roleMenuItems.map((item) => (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() => handleNavigate(item.path)}
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                            >
                                <span className="size-4">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-border p-2">
                        <button
                            type="button"
                            onClick={() => handleNavigate('/feature-preview')}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiSettings className="size-4" />
                            Settings
                        </button>

                        <button
                            type="button"
                            onClick={() => handleNavigate('/feature-preview')}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-foreground transition hover:bg-background hover:text-primary"
                        >
                            <FiHelpCircle className="size-4" />
                            Support
                        </button>
                    </div>

                    <div className="border-t border-border p-2">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-black text-danger transition hover:bg-danger/10"
                        >
                            <FiLogOut className="size-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}