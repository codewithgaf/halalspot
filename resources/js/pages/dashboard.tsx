import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Bookmark, MessageSquare, Sparkles } from 'lucide-react';

import EmailVerificationStatus from '@/components/dashboard/email-verification-status';

import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { Auth } from '@/types';

type SavedPlace = {
    id: string;
    name: string;
    slug: string;
    city: string;
};

type DashboardPageProps = {
    auth: Auth;
    savedPlacesCount: number;
    recentSavedPlaces: SavedPlace[];
};

export default function Dashboard() {
    const { auth, savedPlacesCount, recentSavedPlaces } =
        usePage<DashboardPageProps>().props;

    const firstName = auth.user?.name?.trim().split(/\s+/)[0] || 'there';
    const emailVerified = Boolean(auth.user?.email_verified_at);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <header>
                    <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
                        Your personal space
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                        Your dashboard
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Discover restaurants and keep your favorite places
                        close.
                    </p>
                </header>
                <EmailVerificationStatus verified={emailVerified} />

                {/* Welcome banner */}
                <section
                    aria-label="Welcome"
                    className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-900 to-emerald-600 p-6 text-white sm:p-8"
                >
                    <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border border-white/20" />

                    <div className="relative">
                        <p className="text-xs font-semibold tracking-widest text-emerald-100 uppercase">
                            Welcome back
                        </p>

                        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                            Salaam, {firstName}! 👋
                        </h2>

                        <p className="mt-2 max-w-lg text-sm text-emerald-100">
                            Find your next favorite place and revisit the ones
                            you've saved.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
                            >
                                Explore restaurants
                                <ArrowUpRight className="size-4" />
                            </Link>

                            <Link
                                href={editProfile()}
                                className="rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                            >
                                Edit profile
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Account overview */}
                <section
                    aria-label="Account overview"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                    <div className="rounded-xl border bg-card p-5">
                        <Bookmark className="size-6 text-emerald-600" />

                        <p className="mt-4 text-3xl font-bold">
                            {savedPlacesCount}
                        </p>

                        <h2 className="mt-1 text-sm font-semibold">
                            Saved Places
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Your private collection
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <MessageSquare className="size-6 text-emerald-600" />

                        <p className="mt-4 text-lg font-bold">Coming soon</p>

                        <h2 className="mt-1 text-sm font-semibold">
                            My Reviews
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Planned community feature
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <Sparkles className="size-6 text-emerald-600" />

                        <p className="mt-4 text-lg font-bold">Planned</p>

                        <h2 className="mt-1 text-sm font-semibold">
                            Contribution XP
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Future community feature
                        </p>
                    </div>
                </section>

                {/* Recent saved restaurants */}
                <section
                    aria-labelledby="recent-saved-heading"
                    className="rounded-2xl border bg-card p-5 sm:p-6"
                >
                    <div className="mb-5">
                        <h2
                            id="recent-saved-heading"
                            className="text-lg font-bold"
                        >
                            Your recent saved places
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your three most recently saved published
                            restaurants.
                        </p>
                    </div>

                    {recentSavedPlaces.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center">
                            <Bookmark className="mx-auto size-8 text-muted-foreground" />

                            <h3 className="mt-3 font-semibold">
                                No saved places yet
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Explore restaurants and save your favorites for
                                later.
                            </p>

                            <Link
                                href="/"
                                className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                            >
                                Explore restaurants
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {recentSavedPlaces.map((place) => (
                                <li key={place.id}>
                                    <Link
                                        href={`/restaurants/${encodeURIComponent(place.slug)}`}
                                        className="flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {place.name}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {place.city}
                                            </p>
                                        </div>

                                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="mt-4 text-xs text-muted-foreground">
                        Only your published saved restaurants are shown here.
                    </p>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
