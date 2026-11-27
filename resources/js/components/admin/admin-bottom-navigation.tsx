import { Link } from '@inertiajs/react';
import { LayoutDashboard, MapPin, UserRound, Users } from 'lucide-react';

const tabs = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'My Account', href: '/dashboard', icon: UserRound },
] as const;

type Props = { currentPath: string };

export function AdminBottomNavigation({ currentPath }: Props) {
    return (
        <nav
            aria-label="Admin mobile navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-emerald-950/15 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_26px_rgba(10,40,25,0.08)] backdrop-blur-md lg:hidden dark:border-white/10 dark:bg-[#12251d]/95"
        >
            <div className="mx-auto grid max-w-xl grid-cols-4">
                {tabs.slice(0, 2).map(({ label, href, icon: Icon }) => {
                    const active =
                        href === '/admin'
                            ? currentPath === href
                            : currentPath === href ||
                              currentPath.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex min-h-[68px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-emerald-500 ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            <Icon className="size-5" aria-hidden="true" />
                            {label}
                        </Link>
                    );
                })}
                <span
                    aria-disabled="true"
                    className="flex min-h-[68px] flex-col items-center justify-center gap-1 px-1 text-[11px] text-slate-400 opacity-65 dark:text-slate-500"
                >
                    <MapPin className="size-5" aria-hidden="true" />
                    Restaurants
                    <span className="sr-only">Coming soon</span>
                </span>
                <Link
                    href={tabs[2].href}
                    className="flex min-h-[68px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold text-slate-500 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-slate-400"
                >
                    <UserRound className="size-5" aria-hidden="true" />
                    My Account
                </Link>
            </div>
        </nav>
    );
}
