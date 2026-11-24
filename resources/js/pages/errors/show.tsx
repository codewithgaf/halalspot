import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpRight,
    Compass,
    Home,
    LockKeyhole,
    RefreshCw,
    ServerCrash,
    ShieldAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';

type ErrorStatus = 403 | 404 | 500 | 503;

type ErrorPageProps = {
    status: ErrorStatus;
};

type ErrorContent = {
    heading: string;
    description: string;
    eyebrow: string;
    icon: ReactNode;
};

const content: Record<ErrorStatus, ErrorContent> = {
    403: {
        eyebrow: 'Access restricted',
        heading: 'This area is not available to you.',
        description:
            'You do not have permission to view this page. If you believe you should have access, contact a HalalSpot administrator.',
        icon: <LockKeyhole className="size-7" aria-hidden="true" />,
    },
    404: {
        eyebrow: 'Page not found',
        heading: 'Looks like this spot is missing.',
        description:
            'The page may have moved or the address may be incorrect. You can head back and discover more places on HalalSpot.',
        icon: <Compass className="size-7" aria-hidden="true" />,
    },
    500: {
        eyebrow: 'Something went wrong',
        heading: 'We hit an unexpected bump.',
        description:
            'We could not complete your request right now. Please try again in a moment.',
        icon: <ServerCrash className="size-7" aria-hidden="true" />,
    },
    503: {
        eyebrow: 'Temporarily unavailable',
        heading: 'HalalSpot is taking a short break.',
        description:
            'The service is temporarily unavailable. Please check back soon.',
        icon: <ShieldAlert className="size-7" aria-hidden="true" />,
    },
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const error = content[status] ?? content[500];
    const retryable = status === 500 || status === 503;

    return (
        <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f5f8f6] text-slate-950 dark:bg-[#081a16] dark:text-white">
            <Head title={`${status} · ${error.eyebrow}`} />

            <div
                className="pointer-events-none absolute -top-40 -right-28 size-[28rem] rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-44 -left-36 size-[30rem] rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-900/20"
                aria-hidden="true"
            />

            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
                <Link
                    href="/"
                    className="inline-flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                    aria-label="HalalSpot homepage"
                >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-950 text-emerald-200 shadow-sm dark:bg-emerald-700/30">
                        <Compass className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight">
                        halalspot<span className="text-emerald-600">.</span>
                    </span>
                </Link>
                <span className="hidden items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-emerald-900 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-emerald-200">
                    <span
                        className="size-2 rounded-full bg-emerald-500"
                        aria-hidden="true"
                    />
                    Discover with confidence
                </span>
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
                <section className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-7 text-center shadow-[0_20px_80px_-40px_rgba(6,50,37,0.25)] backdrop-blur sm:p-12 dark:border-white/10 dark:bg-[#102923]/90">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {error.icon}
                    </div>
                    <p className="mt-7 text-xs font-bold tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                        {error.eyebrow}
                    </p>
                    <p
                        className="mt-2 text-[clamp(4.75rem,16vw,8rem)] leading-none font-black tracking-[-0.08em] text-emerald-950 tabular-nums dark:text-emerald-100"
                        aria-label={`Error ${status}`}
                    >
                        {status}
                    </p>
                    <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {error.heading}
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
                        {error.description}
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            <Home className="size-4" aria-hidden="true" />
                            Back to home
                        </Link>
                        {retryable ? (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                <RefreshCw
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Try again
                            </button>
                        ) : (
                            <Link
                                href="/about"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                <ArrowUpRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                About HalalSpot
                            </Link>
                        )}
                    </div>
                    <p className="mt-7 inline-flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <ArrowLeft className="size-3.5" aria-hidden="true" />
                        If you need help, return to the homepage.
                    </p>
                </section>
            </main>

            <footer className="relative z-10 px-5 pb-7 text-center text-xs text-slate-500 dark:text-slate-400">
                HalalSpot · Discover food. Support communities.
            </footer>
        </div>
    );
}
