import React from "react";

export interface AdminMenuItem {
    key: string;
    label: string;
    onClick?: () => void;
}

const AdminSidebar: React.FC<{ menuItems: AdminMenuItem[]; activeMenu: string }> = ({ menuItems, activeMenu }) => {
    return (
        <aside className="bg-muted text-primary-foreground lg:fixed lg:inset-y-0 lg:left-0 lg:h-screen lg:w-64">
            <div className="p-6 border-b border-brand-black/20">
                <h1 className="text-2xl font-bold">TicketFlow</h1>
                <p className="text-sm font-semibold mt-1 text-primary-foreground/80">Admin Panel</p>
            </div>
            <nav className="flex flex-col flex-grow p-4 space-y-2">
                {menuItems.map(({ key, label, onClick }) => {
                    const isActive = key === activeMenu;
                    return (
                        <button
                            key={key}
                            onClick={onClick}
                            className={`block w-full px-4 py-2 text-left font-medium transition-colors ${isActive
                                    ? 'bg-surface text-foreground'
                                    : 'text-primary-foreground hover:bg-brand-black/10'
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
