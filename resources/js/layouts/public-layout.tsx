import type { ReactNode } from 'react';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main id="main-content">{children}</main>
        </div>
    );
}
