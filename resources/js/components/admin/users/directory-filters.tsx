import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { DirectoryFilters as Filters } from './types';

const field =
    'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-white/15 dark:bg-[#17241f] dark:text-white';

export function DirectoryFilters({ filters }: { filters: Filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    useEffect(() => {
        setSearch(filters.search ?? '');
        setRole(filters.role ?? '');
        setStatus(filters.status ?? '');
    }, [filters.search, filters.role, filters.status]);

    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            '/admin/users',
            { search: search.trim(), role, status },
            { replace: true, preserveScroll: true },
        );
    }
    function clear() {
        setSearch('');
        setRole('');
        setStatus('');
        router.get('/admin/users', {}, { replace: true, preserveScroll: true });
    }

    return (
        <form
            role="search"
            onSubmit={apply}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-[#17241f]"
        >
            <div className="grid gap-3 md:grid-cols-3">
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold">
                        Search name or email
                    </span>
                    <span className="relative block">
                        <Search
                            aria-hidden="true"
                            className="absolute top-3.5 left-3 size-4 text-slate-400"
                        />
                        <input
                            type="search"
                            className={`${field} pl-10`}
                            maxLength={100}
                            placeholder="Find an account..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </span>
                </label>
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold">
                        Role
                    </span>
                    <select
                        className={field}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="">All roles</option>
                        <option value="user">Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="administrator">Administrator</option>
                    </select>
                </label>
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold">
                        Account status
                    </span>
                    <select
                        className={field}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="submit"
                    className="min-h-11 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                    Apply filters
                </button>
                <button
                    type="button"
                    onClick={clear}
                    className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-semibold dark:border-white/15"
                >
                    Clear filters
                </button>
            </div>
        </form>
    );
}
