import { Head } from '@inertiajs/react';
import { LayoutGrid, List, Users } from 'lucide-react';
import { useState } from 'react';
import { CommunityGoalCard } from '@/components/admin/users/community-goal-card';
import { DirectoryFilters } from '@/components/admin/users/directory-filters';
import { DirectoryPagination } from '@/components/admin/users/directory-pagination';
import { UserEntry } from '@/components/admin/users/user-entry';
import type {
    DirectoryFilters as Filters,
    PaginatedUsers,
    UserDirectoryStats,
} from '@/components/admin/users/types';

type Props = {
    users: PaginatedUsers;
    filters: Filters;
    stats: UserDirectoryStats;
};

export default function UserDirectory({ users, filters, stats }: Props) {
    const [view, setView] = useState<'cards' | 'list'>('cards');
    return (
        <>
            <Head title="Admin · User Directory" />
            <div className="space-y-6">
                <header>
                    <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
                        Administration / Community
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                        User directory
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Find accounts and follow HalalSpot's community growth.
                    </p>
                </header>
                <CommunityGoalCard activeAccounts={stats.activeAccounts} />
                <section
                    aria-label="Account metrics"
                    className="grid grid-cols-3 gap-2 sm:gap-4"
                >
                    {[
                        { title: 'Total accounts', value: stats.totalAccounts },
                        {
                            title: 'Active accounts',
                            value: stats.activeAccounts,
                        },
                        { title: 'Suspended', value: stats.suspendedAccounts },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-5 dark:border-white/10 dark:bg-[#17241f]"
                        >
                            <p className="text-xs text-slate-500">
                                {item.title}
                            </p>
                            <p className="mt-2 text-2xl font-bold tabular-nums">
                                {item.value.toLocaleString()}
                            </p>
                        </article>
                    ))}
                </section>
                <DirectoryFilters filters={filters} />
                <section aria-labelledby="admin-users-title">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2
                                id="admin-users-title"
                                className="flex items-center gap-2 text-base font-bold"
                            >
                                <Users
                                    className="size-5 text-emerald-600"
                                    aria-hidden="true"
                                />{' '}
                                Registered accounts
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {users.total === 0
                                    ? 'No matching accounts'
                                    : `Showing ${users.from}–${users.to} of ${users.total} filtered accounts`}
                            </p>
                        </div>
                        <div
                            aria-label="Directory view"
                            role="group"
                            className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#17241f]"
                        >
                            <button
                                type="button"
                                onClick={() => setView('cards')}
                                aria-pressed={view === 'cards'}
                                className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-semibold ${view === 'cards' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500'}`}
                            >
                                <LayoutGrid
                                    className="size-4"
                                    aria-hidden="true"
                                />{' '}
                                Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                aria-pressed={view === 'list'}
                                className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-semibold ${view === 'list' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500'}`}
                            >
                                <List className="size-4" aria-hidden="true" />{' '}
                                List
                            </button>
                        </div>
                    </div>
                    {users.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm dark:border-white/10 dark:bg-[#17241f]">
                            No accounts match these filters. Try clearing your
                            search.
                        </div>
                    ) : (
                        <div
                            className={
                                view === 'cards'
                                    ? 'grid gap-3 md:grid-cols-2'
                                    : 'flex flex-col gap-2'
                            }
                        >
                            {users.data.map((user) => (
                                <UserEntry
                                    key={user.id}
                                    user={user}
                                    view={view}
                                />
                            ))}
                        </div>
                    )}
                </section>
                <DirectoryPagination users={users} />
                <p className="text-xs text-slate-500">
                    Read-only directory. Account suspension and role changes
                    remain unavailable in this milestone.
                </p>
            </div>
        </>
    );
}
