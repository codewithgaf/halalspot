import { Link, usePage } from '@inertiajs/react';
import { Bookmark, MapPin, Menu, Plus } from 'lucide-react';
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
        <header className="border-b border-border bg-background">
            <PageContainer className="flex h-18 items-center justify-between gap-4">
                {/* HalalSpot branding */}
                <Link
                    href={home()}
                    aria-label="HalalSpot homepage"
                    className="inline-flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-brand"
                >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10">
                        <MapPin className="size-5" aria-hidden="true" />
                    </span>

                    <span>Halalspot</span>
                </Link>

                {/* Desktop primary navigation */}
                <nav
                    aria-label="Primary navigation"
                    className="hidden h-full items-center gap-6 lg:flex"
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

                {/* Desktop secondary navigation */}
                <div className="hidden items-center gap-2 lg:flex">
                    <button
                        type="button"
                        disabled
                        title="Saved places coming in a future milestone"
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground opacity-60"
                    >
                        <Bookmark className="size-4" aria-hidden="true" />
                        Saved
                    </button>

                    <button
                        type="button"
                        disabled
                        title="Restaurant suggestions coming in a future milestone"
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-brand opacity-60"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Suggest a place
                    </button>

                    <Link
                        href={isAuthenticated ? dashboard() : login()}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Sign in'}
                    </Link>
                </div>

                {/* Mobile and tablet navigation */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open navigation menu"
                                className="inline-flex size-11 items-center justify-center rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-muted-foreground opacity-60"
                                >
                                    <Bookmark
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Saved (coming soon)
                                </button>

                                <button
                                    type="button"
                                    disabled
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
                                        href={
                                            isAuthenticated
                                                ? dashboard()
                                                : login()
                                        }
                                        className="flex min-h-11 items-center justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                    >
                                        {isAuthenticated
                                            ? 'Dashboard'
                                            : 'Sign in'}
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
