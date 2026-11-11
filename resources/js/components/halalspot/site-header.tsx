import { Link } from '@inertiajs/react';

export default function SiteHeader() {
    return (
        <header className="border-b border-border bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    halalspot
                </Link>

                <nav aria-label="Primary navigation">
                    <Link
                        href="/"
                        className="text-sm font-medium hover:underline"
                    >
                        Home
                    </Link>
                </nav>
            </div>
        </header>
    );
}
