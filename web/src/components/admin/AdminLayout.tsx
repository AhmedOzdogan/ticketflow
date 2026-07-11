import type { ReactNode } from 'react';
import AdminSidebar, { type AdminMenuItem } from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar'
interface AdminLayoutProps {
    title: string;
    subtitle?: string;
    activeMenu: string;
    adminEmail?: string;
    menuItems: AdminMenuItem[];
    toolbar?: ReactNode;
    children: ReactNode;
}

export default function AdminLayout({
    title,
    subtitle,
    activeMenu,
    adminEmail,
    menuItems,
    toolbar,
    children,
}: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground lg:flex">
            <AdminSidebar
                menuItems={menuItems}
                activeMenu={activeMenu}
            />

            <div className="flex-1 lg:pl-64">
                <AdminTopbar
                    title={title}
                    subtitle={subtitle}
                    adminEmail={adminEmail}
                />

                {toolbar && (
                    <section className="border-b border-border bg-surface px-4 py-4 sm:px-6">
                        {toolbar}
                    </section>
                )}

                <main className="px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}