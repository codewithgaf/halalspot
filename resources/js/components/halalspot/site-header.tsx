import { Link, usePage } from '@inertiajs/react';
import { MapPin, Menu, Plus } from 'lucide-react';

import LocationSelector from '@/components/halalspot/location-selector';
import PageContainer from '@/components/halalspot/page-container';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard, home, login } from '@/routes';

export default function SiteHeader() {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();

    const isAuthenticated = auth.user !== null;

    const isDiscoverPage = isCurrentUrl(home());
    const isAboutPage = isCurrentUrl('/about');

    const authHref = isAuthenticated ? dashboard() : login();
    const authLabel = isAuthenticated ? 'Dashboard' : 'Sign in';

    const desktopLinkClass =
        'inline-flex h-full items-center border-b-2 px-1 text-sm font-medium transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

    const mobileLinkClass =
        'flex min-h-11 items-center rounded-lg border-l-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

    const activeDesktopClass = 'border-brand font-semibold text-brand';

    const inactiveDesktopClass = 'border-transparent text-muted-foreground';

    const activeMobileClass =
        'border-brand bg-brand/10 font-semibold text-brand';

    const inactiveMobileClass =
        'border-transparent text-foreground hover:bg-accent';

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background">
            <PageContainer className="grid h-[72px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 lg:gap-3">
                {/* Logo and location share a single desktop group.
                    On mobile, display: contents lets the grid place
                    them in separate columns. */}
                <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-3">
                    <Link
                        href={home()}
                        aria-label="HalalSpot homepage"
                        className="inline-flex min-w-0 items-center gap-1 text-xs font-bold tracking-tight whitespace-nowrap text-brand sm:gap-1.5 sm:text-lg lg:shrink-0 lg:gap-2 lg:text-xl"
                    >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 sm:size-8 lg:size-9">
                            <MapPin
                                className="size-4 lg:size-5"
                                aria-hidden="true"
                            />
                        </span>

                        <span>HalalSpot</span>
                    </Link>

                    {/* Single instance preserves state at breakpoints */}
                    <div className="min-w-0 justify-self-center lg:shrink-0">
                        <LocationSelector />
                    </div>
                </div>

                {/* Centered desktop navigation */}
                <nav
                    aria-label="Primary navigation"
                    className="hidden h-full items-center justify-center gap-6 lg:flex"
                >
                    <Link
                        href={home()}
                        aria-current={isDiscoverPage ? 'page' : undefined}
                        className={`${desktopLinkClass} ${
                            isDiscoverPage
                                ? activeDesktopClass
                                : inactiveDesktopClass
                        }`}
                    >
                        Discover
                    </Link>

                    <Link
                        href="/about"
                        aria-current={isAboutPage ? 'page' : undefined}
                        className={`${desktopLinkClass} ${
                            isAboutPage
                                ? activeDesktopClass
                                : inactiveDesktopClass
                        }`}
                    >
                        About
                    </Link>
                </nav>

                {/* Desktop actions */}
                <div className="hidden min-w-0 items-center justify-end gap-2 lg:flex">
                    <button
                        type="button"
                        disabled
                        title="Restaurant suggestions coming in a future milestone"
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-brand opacity-60"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Suggest a place
                    </button>

                    <Link
                        href={authHref}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        {authLabel}
                    </Link>
                </div>

                {/* Mobile and tablet menu */}
                <div className="flex justify-end lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open navigation menu"
                                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                <Menu className="size-5" aria-hidden="true" />
                            </button>
                        </SheetTrigger>

                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>

                            <nav
                                aria-label="Mobile navigation"
                                className="flex flex-col gap-2 px-4"
                            >
                                <SheetClose asChild>
                                    <Link
                                        href={home()}
                                        aria-current={
                                            isDiscoverPage ? 'page' : undefined
                                        }
                                        className={`${mobileLinkClass} ${
                                            isDiscoverPage
                                                ? activeMobileClass
                                                : inactiveMobileClass
                                        }`}
                                    >
                                        Discover
                                    </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Link
                                        href="/about"
                                        aria-current={
                                            isAboutPage ? 'page' : undefined
                                        }
                                        className={`${mobileLinkClass} ${
                                            isAboutPage
                                                ? activeMobileClass
                                                : inactiveMobileClass
                                        }`}
                                    >
                                        About
                                    </Link>
                                </SheetClose>

                                <div
                                    className="my-2 border-t border-border"
                                    aria-hidden="true"
                                />

                                <button
                                    type="button"
                                    disabled
                                    title="Restaurant suggestions coming in a future milestone"
                                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-muted-foreground opacity-60"
                                >
                                    <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Suggest a place (coming soon)
                                </button>

                                <SheetClose asChild>
                                    <Link
                                        href={authHref}
                                        className="flex min-h-11 items-center justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                    >
                                        {authLabel}
                                    </Link>
                                </SheetClose>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </PageContainer>
        </header>
    );
}
