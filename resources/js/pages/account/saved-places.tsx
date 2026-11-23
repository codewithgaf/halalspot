import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bookmark,
    LockKeyhole,
    MapPin,
    Utensils,
} from 'lucide-react';

type SavedPlace = {
    id: string;
    name: string;
    slug: string;
    city: string;
};

type SavedPlacesPageProps = {
    savedPlaces: SavedPlace[];
};

export default function SavedPlaces() {
    const { savedPlaces } = usePage<SavedPlacesPageProps>().props;

    return (
        <>
            <Head title="My Saved Places" />

            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Page introduction */}
                <section
                    aria-labelledby="saved-places-heading"
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-600 p-6 text-white sm:p-8"
                >
                    <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border border-white/20" />

                    <div className="relative">
                        <p className="text-xs font-semibold tracking-widest text-emerald-100 uppercase">
                            HalalSpot · My Account
                        </p>

                        <h1
                            id="saved-places-heading"
                            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                        >
                            My Saved Places
                        </h1>

                        <p className="mt-3 max-w-lg text-sm text-emerald-100">
                            Your personal collection of restaurants, all in one
                            place.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium">
                            <LockKeyhole
                                className="size-4"
                                aria-hidden="true"
                            />
                            Private to your account
                        </div>
                    </div>
                </section>

                {/* Collection overview */}
                <section aria-labelledby="collection-heading">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2
                                id="collection-heading"
                                className="text-lg font-bold"
                            >
                                Your collection
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Published restaurants you've saved, newest
                                first.
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {savedPlaces.length}{' '}
                            {savedPlaces.length === 1
                                ? 'restaurant'
                                : 'restaurants'}
                        </span>
                    </div>

                    {savedPlaces.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card p-8 text-center sm:p-12">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950">
                                <Bookmark
                                    className="size-7 text-emerald-700 dark:text-emerald-400"
                                    aria-hidden="true"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-semibold">
                                No saved places yet
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                                Start exploring restaurants and save your
                                favorites to find them here later.
                            </p>

                            <Link
                                href="/"
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                            >
                                Explore restaurants
                                <ArrowUpRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {savedPlaces.map((place) => (
                                <li key={place.id}>
                                    <Link
                                        href={`/restaurants/${encodeURIComponent(place.slug)}`}
                                        className="group flex h-full min-w-0 items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:p-5"
                                    >
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                                            <Utensils
                                                className="size-6 text-emerald-700 dark:text-emerald-400"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-sm font-semibold sm:text-base">
                                                {place.name}
                                            </h3>

                                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin
                                                    className="size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                <span className="truncate">
                                                    {place.city}
                                                </span>
                                            </p>

                                            <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                View restaurant details
                                            </p>
                                        </div>

                                        <ArrowUpRight
                                            className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <p className="text-xs text-muted-foreground">
                    Only your saved published restaurants appear here. Saving a
                    restaurant does not indicate halal certification.
                </p>
            </div>
        </>
    );
}
