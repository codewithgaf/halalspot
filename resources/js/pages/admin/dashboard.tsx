import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Archive,
    CheckCircle2,
    Clock3,
    MapPin,
    ShieldCheck,
    Users,
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

type MetricProps = {
    label: string;
    value: number;
    note: string;
    icon: ReactNode;
    tone: string;
};

function Metric({ label, value, note, icon, tone }: MetricProps) {
    return (
        <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_24px_rgba(15,50,35,0.035)] sm:p-6 dark:border-white/10 dark:bg-[#17241f]">
            <div className="flex items-start justify-between gap-3">
                <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                <span
                    className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            </div>
            <p className="mt-3 text-[34px] leading-none font-extrabold tracking-[-0.04em] text-slate-900 tabular-nums dark:text-white">
                {value.toLocaleString()}
            </p>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-400">
                {note}
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
    const percent = (count: number) =>
        total === 0 ? 0 : Math.max(0, Math.min(100, (count / total) * 100));
    const publishedPercent = Math.round(percent(publishedRestaurants));

    return (
        <>
            <Head title="Admin · Overview" />
            <div className="space-y-7 sm:space-y-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-400">
                            Workspace / Overview
                        </p>
                        <h1 className="mt-2 text-[30px] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-[38px] dark:text-white">
                            Good to see you.
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            A snapshot of your HalalSpot restaurant directory.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-200"
                    >
                        View public site{' '}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                <section
                    aria-label="Restaurant metrics"
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <Metric
                        label="Total restaurants"
                        value={totalRestaurants}
                        note="All directory listings"
                        icon={<MapPin className="size-5" />}
                        tone="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"
                    />
                    <Metric
                        label="Published"
                        value={publishedRestaurants}
                        note="Visible to visitors"
                        icon={<CheckCircle2 className="size-5" />}
                        tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                    />
                    <Metric
                        label="Drafts"
                        value={draftRestaurants}
                        note="Not yet published"
                        icon={<Clock3 className="size-5" />}
                        tone="bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                    />
                    <Metric
                        label="Archived"
                        value={archivedRestaurants}
                        note="Out of discovery"
                        icon={<Archive className="size-5" />}
                        tone="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"
                    />
                </section>

                <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(270px,1fr)]">
                    <section
                        aria-labelledby="publication-heading"
                        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_24px_rgba(15,50,35,0.035)] dark:border-white/10 dark:bg-[#17241f]"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2
                                    id="publication-heading"
                                    className="text-base font-bold text-slate-950 dark:text-white"
                                >
                                    Publication health
                                </h2>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    How your restaurant listings are distributed
                                </p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                {publishedPercent}% published
                            </span>
                        </div>
                        <div
                            className="mt-8 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                            role="img"
                            aria-label={`${publishedRestaurants} published, ${draftRestaurants} draft and ${archivedRestaurants} archived out of ${totalRestaurants} total restaurants`}
                        >
                            <div
                                className="bg-emerald-600"
                                style={{
                                    width: `${percent(publishedRestaurants)}%`,
                                }}
                            />
                            <div
                                className="bg-amber-400"
                                style={{
                                    width: `${percent(draftRestaurants)}%`,
                                }}
                            />
                            <div
                                className="bg-slate-400"
                                style={{
                                    width: `${percent(archivedRestaurants)}%`,
                                }}
                            />
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    label: 'Published',
                                    value: publishedRestaurants,
                                    dot: 'bg-emerald-600',
                                },
                                {
                                    label: 'Draft',
                                    value: draftRestaurants,
                                    dot: 'bg-amber-400',
                                },
                                {
                                    label: 'Archived',
                                    value: archivedRestaurants,
                                    dot: 'bg-slate-400',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs dark:bg-white/5"
                                >
                                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
                                        <span
                                            className={`size-2 rounded-full ${item.dot}`}
                                        />
                                        {item.label}
                                    </span>
                                    <strong className="text-slate-950 tabular-nums dark:text-white">
                                        {item.value}
                                    </strong>
                                </div>
                            ))}
                        </div>
                        {total === 0 && (
                            <p className="mt-4 text-xs text-slate-500">
                                No restaurant records yet.
                            </p>
                        )}
                    </section>

                    <section
                        aria-labelledby="next-step-heading"
                        className="relative overflow-hidden rounded-2xl border border-emerald-950/10 bg-[#eaf5ee] p-6 dark:border-emerald-300/10 dark:bg-[#12382d]"
                    >
                        <div className="pointer-events-none absolute -top-12 -right-12 size-44 rounded-full border border-emerald-500/10" />
                        <span className="flex size-11 items-center justify-center rounded-xl bg-white text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                            <ShieldCheck
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="mt-5 text-[11px] font-bold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-300">
                            Your workspace
                        </p>
                        <h2
                            id="next-step-heading"
                            className="mt-2 text-xl font-extrabold tracking-tight text-[#123a2b] dark:text-white"
                        >
                            Manage with confidence.
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-emerald-950/65 dark:text-emerald-100/70">
                            Browse community accounts in the read-only user
                            directory. Account changes are coming in a later
                            milestone.
                        </p>
                        <Link
                            href="/admin/users"
                            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0c6247] px-4 text-xs font-bold text-white transition hover:bg-[#094c38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                        >
                            <Users className="size-4" aria-hidden="true" />{' '}
                            Explore users{' '}
                            <ArrowUpRight
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </section>
                </div>
            </div>
        </>
    );
}
