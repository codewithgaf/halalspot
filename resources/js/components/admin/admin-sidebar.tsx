import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    LayoutDashboard,
    MapPin,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { AdminBrand } from './admin-brand';

type AdminSidebarProps = {
    currentPath: string;
    onNavigate?: () => void;
};

const pages = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'User directory', href: '/admin/users', icon: Users },
];

function isActive(path: string, href: string): boolean {
    return href === '/admin'
        ? path === href
        : path === href || path.startsWith(`${href}/`);
}

export function AdminSidebar({ currentPath, onNavigate }: AdminSidebarProps) {
    return (
        <>
            <AdminBrand onNavigate={onNavigate} />
            <nav
                aria-label="Admin navigation"
                className="flex-1 space-y-8 px-3"
            >
                <div>
                    <p className="px-3 pb-3 text-[10px] font-bold tracking-[0.2em] text-emerald-100/40 uppercase">
                        Workspace
                    </p>
                    <div className="space-y-1.5">
                        {pages.map(({ label, href, icon: Icon }) => {
                            const active = isActive(currentPath, href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${active ? 'bg-white/15 font-semibold text-white shadow-sm ring-1 ring-white/10' : 'font-medium text-emerald-50/65 hover:bg-white/8 hover:text-white'}`}
                                >
                                    <Icon
                                        className={`size-[18px] ${active ? 'text-[#82e1b4]' : 'text-emerald-100/50'}`}
                                        aria-hidden="true"
                                    />
                                    {label}
                                    {active && (
                                        <span
                                            className="ml-auto size-1.5 rounded-full bg-[#74e0ab]"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <p className="px-3 pb-3 text-[10px] font-bold tracking-[0.2em] text-emerald-100/40 uppercase">
                        Coming later
                    </p>
                    <div
                        className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] text-emerald-50/40"
                        aria-disabled="true"
                    >
                        <MapPin className="size-[18px]" aria-hidden="true" />
                        <span className="flex-1">Restaurants</span>
                        <span className="rounded-md bg-white/8 px-2 py-1 text-[10px] font-medium">
                            Soon
                        </span>
                    </div>
                </div>
            </nav>
            <div className="space-y-3 border-t border-white/10 p-4">
                <div className="flex items-start gap-2.5 rounded-xl bg-white/6 p-3 text-[11px] leading-5 text-emerald-50/65">
                    <ShieldCheck
                        className="mt-0.5 size-4 shrink-0 text-[#8ce7b7]"
                        aria-hidden="true"
                    />
                    Protected admin workspace
                </div>
                <Link
                    href="/dashboard"
                    onClick={onNavigate}
                    className="flex min-h-11 items-center justify-between rounded-xl bg-emerald-200 px-3 text-xs font-semibold text-emerald-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                    <span className="flex items-center gap-2">
                        <UserRound className="size-4" aria-hidden="true" /> Go
                        to User Dashboard
                    </span>
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                    href="/"
                    onClick={onNavigate}
                    className="flex min-h-11 items-center justify-between rounded-xl px-3 text-xs font-semibold text-emerald-50/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                    Visit HalalSpot{' '}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </>
    );
}
