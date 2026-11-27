import type { DirectoryUser } from './types';

type Props = { user: DirectoryUser; view: 'cards' | 'list' };

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
        <article
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-[#17241f] ${view === 'list' ? 'sm:flex sm:items-center sm:justify-between sm:gap-4' : ''}`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"
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
            <div
                className={`flex flex-wrap items-center gap-2 ${view === 'cards' ? 'mt-4 border-t border-slate-100 pt-3 dark:border-white/10' : 'mt-3 sm:mt-0'}`}
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
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300'}`}
                >
                    {active ? 'Active' : 'Suspended'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Joined {joined}
                </span>
            </div>
        </article>
    );
}
