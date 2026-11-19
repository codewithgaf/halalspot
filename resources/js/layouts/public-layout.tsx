import type { ReactNode } from 'react';

import FloatingSavedPlaces from '@/components/halalspot/floating-saved-places';
import SiteHeader from '@/components/halalspot/site-header';
import { SavedPlacesProvider } from '@/contexts/saved-places-context';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <SavedPlacesProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <SiteHeader />

                <main id="main-content" className="flex-1">
                    {children}
                </main>

                <FloatingSavedPlaces />
            </div>
        </SavedPlacesProvider>
    );
}
