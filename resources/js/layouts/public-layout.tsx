import type { ReactNode } from 'react';
import SiteHeader from '@/components/halalspot/site-header';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />

            <main id="main-content" className="flex-1">
                {children}
            </main>
        </div>
    );
}
