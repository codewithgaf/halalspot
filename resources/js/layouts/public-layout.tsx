import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { AccountBottomNav } from '@/components/account-bottom-nav';
import FloatingSavedPlaces from '@/components/halalspot/floating-saved-places';
import SiteHeader from '@/components/halalspot/site-header';
import { SavedPlacesProvider } from '@/contexts/saved-places-context';
import { cn } from '@/lib/utils';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage().props;
    const isAuthenticated = auth.user !== null;

    return (
        <SavedPlacesProvider>
            <div
                className={cn(
                    'flex min-h-screen flex-col bg-background text-foreground',
                    isAuthenticated &&
                        'pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0',
                )}
            >
                <SiteHeader />

                <main id="main-content" className="flex-1">
                    {children}
                </main>

                <FloatingSavedPlaces />

                {isAuthenticated && <AccountBottomNav />}
            </div>
        </SavedPlacesProvider>
    );
}
