import { Link } from '@inertiajs/react';
import { Bookmark, Compass, House, UserRound } from 'lucide-react';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

const tabs = [
    {
        label: 'Explore',
        href: '/',
        icon: Compass,
    },
    {
        label: 'Home',
        href: dashboard(),
        icon: House,
    },
    {
        label: 'Saved',
        href: '/account/saved-places',
        icon: Bookmark,
    },
    {
        label: 'Profile',
        href: editProfile(),
        icon: UserRound,
    },
];

export function AccountBottomNav() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Account navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
            <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
                {tabs.map((tab) => {
                    const isActive = isCurrentUrl(tab.href);
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.label}
                            href={tab.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
                                isActive
                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="size-5" aria-hidden="true" />

                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
