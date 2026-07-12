import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageHeader } from '../ui/PageHeader';
import type { PageHeaderProps } from '../ui/PageHeader';

interface PageContainerProps extends PageHeaderProps {
    children: ReactNode;
}

export default function PageContainer({
    title,
    description,
    role,
    organizerStatus,
    children,
}: PageContainerProps) {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-[#F7F7F8] px-4 py-8 text-[#1E1E1E] dark:bg-[#0B0F14] dark:text-[#E6E6E6] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">
                    <PageHeader
                        title={title}
                        description={description}
                        organizerStatus={organizerStatus}
                        role={role}

                    />

                    {children}
                </div>
            </main>
            <Footer />
        </>
    );
}