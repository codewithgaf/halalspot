import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Fingerprint,
    LockKeyhole,
    Mail,
    ShieldCheck,
    ShieldX,
    UserRound,
    Users,
} from 'lucide-react';

type Account = {
    id: number;
    name: string;
    email: string;
    account_status: 'active' | 'suspended';
    roles: string[];
    email_verified: boolean;
    created_at: string | null;
};

type Props = {
    account: Account;
};

function getInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

function formatDate(date: string | null): string {
    if (!date) {
        return 'Unknown';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return 'Unknown';
    }

    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function AccountDetails({ account }: Props) {
    const active = account.account_status === 'active';

    return (
        <>
            <Head title={`Admin · ${account.name}`} />

            <main className="mx-auto w-full max-w-5xl space-y-6 pb-8">
                {/* Breadcrumb and navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/admin/users"
                        className="group inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400"
                    >
                        <ArrowLeft
                            aria-hidden="true"
                            className="size-4 transition-transform group-hover:-translate-x-1"
                        />
                        Back to User Directory
                    </Link>

                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <LockKeyhole
                            aria-hidden="true"
                            className="size-3.5 text-emerald-500"
                        />
                        Read-only view
                    </span>
                </div>

                {/* Page heading */}
                <header>
                    <p className="mb-2 text-xs font-bold tracking-[0.15em] text-emerald-600 uppercase dark:text-emerald-400">
                        Administration / Community
                    </p>

                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                        Account overview
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        View member information, account status, and
                        verification details.
                    </p>
                </header>

                {/* Account profile hero */}
                <section
                    aria-label="Account profile"
                    className="relative overflow-hidden rounded-3xl border border-emerald-800 bg-gradient-to-br from-[#064e3b] via-[#075b43] to-[#102820] text-white shadow-xl shadow-emerald-950/10"
                >
                    {/* Decorative background */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border border-white/10 bg-emerald-300/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-20 -bottom-36 size-72 rounded-full border border-white/10"
                    />

                    <div className="relative p-5 sm:p-8">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                            {/* Main identity */}
                            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                <div
                                    aria-hidden="true"
                                    className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl font-extrabold text-emerald-50 shadow-lg backdrop-blur-sm sm:size-20 sm:text-2xl"
                                >
                                    {getInitials(account.name)}
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-xs font-semibold tracking-widest text-emerald-200 uppercase">
                                        HalalSpot member
                                    </p>

                                    <h2 className="text-xl font-bold tracking-tight break-words sm:text-2xl">
                                        {account.name}
                                    </h2>

                                    <p className="mt-1 text-sm break-all text-emerald-100/80">
                                        {account.email}
                                    </p>
                                </div>
                            </div>

                            {/* Account identity */}
                            <div className="w-fit rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <p className="text-[10px] font-bold tracking-widest text-emerald-200 uppercase">
                                    Account ID
                                </p>
                                <p className="mt-1 font-mono text-lg font-bold">
                                    #{account.id}
                                </p>
                            </div>
                        </div>

                        {/* Profile badges */}
                        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/15 pt-5">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                    active
                                        ? 'bg-emerald-300/20 text-emerald-100'
                                        : 'bg-amber-300/20 text-amber-100'
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`size-2 rounded-full ${
                                        active
                                            ? 'bg-emerald-300'
                                            : 'bg-amber-300'
                                    }`}
                                />
                                {active
                                    ? 'Active account'
                                    : 'Suspended account'}
                            </span>

                            {account.roles.length ? (
                                account.roles.map((role) => (
                                    <span
                                        key={role}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white capitalize"
                                    >
                                        <Users
                                            aria-hidden="true"
                                            className="size-3.5"
                                        />
                                        {role === 'user' ? 'Member' : role}
                                    </span>
                                ))
                            ) : (
                                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs">
                                    No role assigned
                                </span>
                            )}

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-emerald-50">
                                {account.email_verified ? (
                                    <CheckCircle2
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                ) : (
                                    <Clock3
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                )}
                                {account.email_verified
                                    ? 'Email verified'
                                    : 'Email not verified'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Account information cards */}
                <div className="grid gap-5 lg:grid-cols-5">
                    {/* Account information */}
                    <section
                        aria-labelledby="account-information-title"
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3 dark:border-white/10 dark:bg-[#17241f]"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <UserRound
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </div>

                            <div>
                                <h3
                                    id="account-information-title"
                                    className="font-bold text-slate-950 dark:text-white"
                                >
                                    Account information
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Basic member details
                                </p>
                            </div>
                        </div>

                        <dl className="divide-y divide-slate-100 dark:divide-white/10">
                            <div className="flex items-start gap-3 py-4 first:pt-0">
                                <Mail
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                                />
                                <div className="min-w-0">
                                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                                        Email address
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold break-all text-slate-900 dark:text-white">
                                        {account.email}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-4">
                                <Users
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                                />
                                <div>
                                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                                        Assigned roles
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 capitalize dark:text-white">
                                        {account.roles.length
                                            ? account.roles
                                                  .map((role) =>
                                                      role === 'user'
                                                          ? 'Member'
                                                          : role,
                                                  )
                                                  .join(', ')
                                            : 'No role assigned'}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-4 last:pb-0">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                                />
                                <div>
                                    <dt className="text-xs text-slate-500 dark:text-slate-400">
                                        Registration date
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                        {formatDate(account.created_at)}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </section>

                    {/* Account security summary */}
                    <section
                        aria-labelledby="account-security-title"
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2 dark:border-white/10 dark:bg-[#17241f]"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <ShieldCheck
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </div>

                            <div>
                                <h3
                                    id="account-security-title"
                                    className="font-bold text-slate-950 dark:text-white"
                                >
                                    Account status
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Current account information
                                </p>
                            </div>
                        </div>

                        <dl className="space-y-5">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                                <dt className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Fingerprint
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    Account access
                                </dt>

                                <dd
                                    className={`inline-flex items-center gap-2 text-sm font-bold ${
                                        active
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}
                                >
                                    {active ? (
                                        <CheckCircle2
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    ) : (
                                        <ShieldX
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    )}
                                    {active ? 'Active' : 'Suspended'}
                                </dd>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                                <dt className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Mail
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    Email verification
                                </dt>

                                <dd
                                    className={`inline-flex items-center gap-2 text-sm font-bold ${
                                        account.email_verified
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}
                                >
                                    {account.email_verified ? (
                                        <CheckCircle2
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    ) : (
                                        <Clock3
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    )}
                                    {account.email_verified
                                        ? 'Verified'
                                        : 'Not verified'}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                {/* Read-only explanation */}
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                    <ShieldCheck
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />

                    <div>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                            Protected administrator view
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                            This page displays account information for
                            administrative review only. Account suspension,
                            reactivation, and role management are not available
                            in this milestone.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
