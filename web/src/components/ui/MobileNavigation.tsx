import { FiCalendar, FiHome } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const mobileNavigationLinks = [
    { label: 'Home', path: '/', icon: FiHome },
    { label: 'Events', path: '/events', icon: FiCalendar },
];

export function MobileNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-border bg-surface/80 p-1 shadow-sm backdrop-blur md:hidden">
            <div className="grid grid-cols-2 gap-1">
                {mobileNavigationLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                        <button
                            key={link.path}
                            type="button"
                            onClick={() => navigate(link.path)}
                            className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-background hover:text-primary'
                                }`}
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}