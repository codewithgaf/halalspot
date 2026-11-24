import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    LayoutDashboard,
    MapPin,
    Menu,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

type AdminLayoutProps = { children: ReactNode };

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = (
        <>
            <div className="px-5 pt-7 pb-7">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-3 text-white"
                >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/20">
                        <MapPin
                            className="size-5 text-emerald-300"
                            aria-hidden="true"
                        />
                    </span>
                    <span>
                        <span className="block text-xl font-extrabold tracking-tight">
                            halalspot<span className="text-emerald-300">.</span>
                        </span>
                        <span className="block text-[10px] font-semibold tracking-[0.23em] text-emerald-200/65 uppercase">
                            Admin workspace
                        </span>
                    </span>
                </Link>
            </div>

            <nav
                aria-label="Admin navigation"
                className="flex-1 space-y-6 px-3"
            >
                <div>
                    <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-emerald-100/50 uppercase">
                        Workspace
                    </p>
                    <Link
                        href="/admin"
                        aria-current="page"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl bg-white/12 px-3 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/20"
                    >
                        <LayoutDashboard
                            className="size-[18px] text-emerald-300"
                            aria-hidden="true"
                        />
                        Overview
                    </Link>
                </div>
                <div>
                    <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-emerald-100/50 uppercase">
                        Directory
                    </p>
                    <div
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/55"
                        aria-disabled="true"
                    >
                        <MapPin className="size-[18px]" aria-hidden="true" />
                        <span className="flex-1">Restaurants</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold">
                            Soon
                        </span>
                    </div>
                </div>
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-400/10 p-3 text-xs leading-relaxed text-emerald-100/80">
                    <ShieldCheck
                        className="size-5 shrink-0 text-emerald-300"
                        aria-hidden="true"
                    />
                    Restricted administrator area
                </div>
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-50/75 transition hover:bg-white/10 hover:text-white"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to HalalSpot
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#f5f7f6] text-slate-900 dark:bg-[#0b1412] dark:text-slate-100">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#052e25] lg:flex">
                {navigation}
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-8 dark:border-white/10 dark:bg-[#10201c]/90">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open admin navigation"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-admin-navigation"
                            onClick={() => setMobileMenuOpen(true)}
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden dark:border-white/10"
                        >
                            <Menu className="size-5" />
                        </button>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold tracking-tight">
                                HalalSpot Admin
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Restaurant directory
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-500" />{' '}
                        Admin workspace
                    </span>
                </header>
                <main
                    id="admin-main"
                    className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-8 sm:py-10 lg:px-10"
                >
                    {children}
                </main>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/70"
                        aria-label="Close admin navigation"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside
                        id="mobile-admin-navigation"
                        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#052e25] shadow-2xl"
                    >
                        <button
                            type="button"
                            aria-label="Close admin navigation"
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-5 right-3 z-10 flex size-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
                        >
                            <X className="size-5" />
                        </button>
                        {navigation}
                    </aside>
                </div>
            )}
        </div>
    );
}
