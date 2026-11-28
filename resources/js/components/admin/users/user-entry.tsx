import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { DirectoryUser } from './types';

type Props = {
    user: DirectoryUser;
    view: 'cards' | 'list';
};

export function UserEntry({ user, view }: Props) {
    const initials =
        user.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || '?';

    const joined = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Unknown';

    const active = user.account_status === 'active';

    return (
        <Link
            href={`/admin/users/${user.id}`}
            aria-label={`View account details for ${user.name}`}
            className={`group relative block min-w-0 rounded-2xl border border-slate-200 bg-white p-4 pr-12 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none sm:p-5 sm:pr-12 dark:border-white/10 dark:bg-[#17241f] dark:hover:border-emerald-500 ${
                view === 'list'
                    ? 'sm:flex sm:items-center sm:justify-between sm:gap-4'
                    : ''
            }`}
        >
            {/* User identity */}
            <div className="flex min-w-0 items-center gap-3">
                <div
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:group-hover:bg-emerald-400/20"
                >
                    {initials}
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                        {user.name}
                    </h3>

                    <p className="text-xs break-all text-slate-500 dark:text-slate-400">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* User roles, status, and registration date */}
            <div
                className={`flex min-w-0 flex-wrap items-center gap-2 ${
                    view === 'cards'
                        ? 'mt-4 border-t border-slate-100 pt-3 dark:border-white/10'
                        : 'mt-3 sm:mt-0'
                }`}
            >
                {user.roles.length ? (
                    user.roles.map((role) => (
                        <span
                            key={role}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize dark:bg-white/10 dark:text-slate-200"
                        >
                            {role === 'user' ? 'Member' : role}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-slate-400">
                        No role assigned
                    </span>
                )}

                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300'
                    }`}
                >
                    {active ? 'Active' : 'Suspended'}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Joined {joined}
                </span>
            </div>

            {/* Visual navigation cue: the entire card is clickable */}
            <ArrowUpRight
                aria-hidden="true"
                className="absolute top-4 right-4 size-5 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 group-focus-visible:text-emerald-600 motion-reduce:transform-none motion-reduce:transition-none sm:top-5 sm:right-5 dark:text-slate-500 dark:group-hover:text-emerald-400 dark:group-focus-visible:text-emerald-400"
            />
        </Link>
    );
}
