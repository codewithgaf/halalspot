import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, home, login, register } from '@/routes';

export default function SiteHeader() {
    const { auth } = usePage().props;
    const isAuthenticated = auth.user !== null;

    return (
        <header className="border-b border-border bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* HalalSpot brand */}
                <Link
                    href={home()}
                    className="text-xl font-bold tracking-tight text-brand"
                >
                    halalspot
                </Link>

                {/* Desktop navigation */}
                <nav
                    aria-label="Primary navigation"
                    className="hidden items-center gap-6 md:flex"
                >
                    <Link
                        href={home()}
                        className="text-sm font-medium hover:text-brand"
                    >
                        Home
                    </Link>

                    {isAuthenticated ? (
                        <Link
                            href={dashboard()}
                            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="text-sm font-medium hover:text-brand"
                            >
                                Log in
                            </Link>

                            <Link
                                href={register()}
                                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile navigation */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open navigation menu"
                                className="inline-flex size-10 items-center justify-center rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                                <Menu aria-hidden="true" className="size-5" />
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
                                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                                    >
                                        Home
                                    </Link>
                                </SheetClose>

                                {isAuthenticated ? (
                                    <SheetClose asChild>
                                        <Link
                                            href={dashboard()}
                                            className="rounded-md bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
                                        >
                                            Dashboard
                                        </Link>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Link
                                                href={login()}
                                                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                                            >
                                                Log in
                                            </Link>
                                        </SheetClose>

                                        <SheetClose asChild>
                                            <Link
                                                href={register()}
                                                className="rounded-md bg-brand px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
                                            >
                                                Register
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
