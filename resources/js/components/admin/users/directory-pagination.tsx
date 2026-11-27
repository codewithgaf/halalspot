import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginatedUsers } from './types';

export function DirectoryPagination({ users }: { users: PaginatedUsers }) {
    if (users.last_page <= 1) return null;
    const base =
        'inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-white/15 dark:bg-[#17241f]';
    return (
        <nav
            aria-label="User directory pagination"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-white/10"
        >
            <span className="text-xs text-slate-500">
                Page {users.current_page} of {users.last_page}
            </span>
            <div className="flex gap-2">
                {users.prev_page_url ? (
                    <Link
                        href={users.prev_page_url}
                        preserveScroll
                        className={base}
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Previous
                    </Link>
                ) : (
                    <span aria-disabled="true" className={`${base} opacity-50`}>
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Previous
                    </span>
                )}
                {users.next_page_url ? (
                    <Link
                        href={users.next_page_url}
                        preserveScroll
                        className={base}
                    >
                        Next
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span aria-disabled="true" className={`${base} opacity-50`}>
                        Next
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </span>
                )}
            </div>
        </nav>
    );
}
