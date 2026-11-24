import { Head, Link, usePage } from '@inertiajs/react';
import {
    Archive,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    LayoutDashboard,
    MapPin,
    ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';

type DashboardProps = {
    metrics: {
        totalRestaurants: number;
        publishedRestaurants: number;
        draftRestaurants: number;
        archivedRestaurants: number;
    };
};

type StatCardProps = {
    label: string;
    value: number;
    description: string;
    icon: ReactNode;
    accent: string;
};

function StatCard({ label, value, description, icon, accent }: StatCardProps) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 dark:border-white/10 dark:bg-[#15231f]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {label}
                    </h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950 tabular-nums dark:text-white">
                        {value.toLocaleString()}
                    </p>
                </div>
                <div
                    className={`flex size-11 items-center justify-center rounded-xl ${accent}`}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                {description}
            </p>
        </article>
    );
}

export default function Dashboard() {
    const {
        totalRestaurants,
        publishedRestaurants,
        draftRestaurants,
        archivedRestaurants,
    } = usePage<DashboardProps>().props.metrics;

    const total = Math.max(0, totalRestaurants);
    const publishedPercent =
        total > 0
            ? Math.min(
                  100,
                  Math.max(0, Math.round((publishedRestaurants / total) * 100)),
              )
            : 0;
    const draftPercent = total > 0 ? (draftRestaurants / total) * 100 : 0;
    const publishedWidth = total > 0 ? (publishedRestaurants / total) * 100 : 0;
    const archivedWidth = total > 0 ? (archivedRestaurants / total) * 100 : 0;

    return (
        <>
            <Head title="Admin · Overview" />
            <div className="space-y-8">
                <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-xs font-bold tracking-[0.17em] text-emerald-700 uppercase dark:text-emerald-400">
                            Administration / Overview
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                            Directory overview
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            A clear view of the restaurant listings currently
                            stored in HalalSpot.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                        View public site{' '}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                </header>

                <section
                    aria-label="Restaurant metrics"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <StatCard
                        label="Total restaurants"
                        value={totalRestaurants}
                        description="All directory records"
                        icon={<MapPin className="size-5" />}
                        accent="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                    />
                    <StatCard
                        label="Published"
                        value={publishedRestaurants}
                        description="Visible in public discovery"
                        icon={<CheckCircle2 className="size-5" />}
                        accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    />
                    <StatCard
                        label="Drafts"
                        value={draftRestaurants}
                        description="Not yet publicly visible"
                        icon={<Clock3 className="size-5" />}
                        accent="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    />
                    <StatCard
                        label="Archived"
                        value={archivedRestaurants}
                        description="Removed from discovery"
                        icon={<Archive className="size-5" />}
                        accent="bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                    />
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
                    <section
                        aria-labelledby="listing-health-heading"
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#15231f]"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="listing-health-heading"
                                    className="text-lg font-bold"
                                >
                                    Listing status
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Distribution of existing restaurant records
                                </p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                {publishedPercent}% published
                            </span>
                        </div>
                        <div
                            className="mt-8 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                            role="img"
                            aria-label={`${publishedRestaurants} published, ${draftRestaurants} draft, ${archivedRestaurants} archived out of ${totalRestaurants} restaurants`}
                        >
                            <div
                                className="bg-emerald-600"
                                style={{ width: `${publishedWidth}%` }}
                            />
                            <div
                                className="bg-amber-400"
                                style={{ width: `${draftPercent}%` }}
                            />
                            <div
                                className="bg-slate-400"
                                style={{ width: `${archivedWidth}%` }}
                            />
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    name: 'Published',
                                    count: publishedRestaurants,
                                    color: 'bg-emerald-600',
                                },
                                {
                                    name: 'Draft',
                                    count: draftRestaurants,
                                    color: 'bg-amber-400',
                                },
                                {
                                    name: 'Archived',
                                    count: archivedRestaurants,
                                    color: 'bg-slate-400',
                                },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 dark:border-white/10"
                                >
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <span
                                            className={`size-2 rounded-full ${item.color}`}
                                        />
                                        {item.name}
                                    </div>
                                    <span className="text-sm font-bold tabular-nums">
                                        {item.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {total === 0 && (
                            <p className="mt-5 text-sm text-slate-500">
                                No restaurant records yet. Counts will update
                                when records are created.
                            </p>
                        )}
                    </section>

                    <section
                        aria-labelledby="workspace-heading"
                        className="relative overflow-hidden rounded-2xl bg-[#052e25] p-6 text-white shadow-sm"
                    >
                        <div className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full border border-emerald-300/15" />
                        <div className="pointer-events-none absolute -top-8 -right-2 size-32 rounded-full border border-emerald-300/15" />
                        <div className="relative">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h2
                                id="workspace-heading"
                                className="mt-5 text-lg font-bold"
                            >
                                A trustworthy directory starts here.
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-emerald-100/75">
                                Your overview reflects the restaurant records in
                                HalalSpot. Restaurant management tools are
                                coming in a future milestone.
                            </p>
                            <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-medium text-emerald-100/85">
                                <LayoutDashboard className="size-4 text-emerald-300" />{' '}
                                A-01A · Overview available
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
