import { Head, Link, usePage } from '@inertiajs/react';
import { Bookmark, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import HomepageHero from '@/components/halalspot/homepage-hero';
import PageContainer from '@/components/halalspot/page-container';
import PublicPlaceCard from '@/components/halalspot/public-place-card';
import PublicLayout from '@/layouts/public-layout';
import { login } from '@/routes';
import type { PublicPlace } from '@/types/halalspot/public-place';

type WelcomeProps = {
    places: PublicPlace[];
};

export default function Welcome({ places }: WelcomeProps) {
    const { auth } = usePage().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<PublicPlace | null>(
        null,
    );

    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredPlaces = places.filter((place) => {
        if (!normalizedQuery) {
            return true;
        }

        return (
            place.name.toLowerCase().includes(normalizedQuery) ||
            place.city.toLowerCase().includes(normalizedQuery)
        );
    });

    function handleSaveRequest(place: PublicPlace) {
        // No database saving yet. This is only the UI step.
        previousFocusRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        setSelectedPlace(place);
    }

    function closeDialog() {
        setSelectedPlace(null);
        previousFocusRef.current?.focus();
    }

    useEffect(() => {
        if (!selectedPlace) {
            return;
        }

        closeButtonRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setSelectedPlace(null);
                previousFocusRef.current?.focus();
            }

            if (event.key === 'Tab') {
                const dialog = document.getElementById(
                    'save-restaurant-dialog',
                );

                if (!dialog) return;

                const focusable = Array.from(
                    dialog.querySelectorAll<HTMLElement>(
                        'button:not([disabled]), a[href]',
                    ),
                );

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (!first || !last) return;

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPlace]);

    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <HomepageHero
                appliedQuery={searchQuery}
                onSearch={setSearchQuery}
            />

            <PageContainer>
                <section aria-label="Restaurant results" className="py-8">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                Explore restaurants
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Discover published places in your area.
                            </p>
                        </div>

                        <p
                            className="text-sm text-muted-foreground"
                            aria-live="polite"
                        >
                            {filteredPlaces.length}{' '}
                            {filteredPlaces.length === 1
                                ? 'restaurant'
                                : 'restaurants'}{' '}
                            found
                        </p>
                    </div>

                    {filteredPlaces.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-background px-6 py-12 text-center">
                            <h3 className="text-lg font-semibold text-foreground">
                                No restaurants found
                            </h3>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Try another restaurant name or city.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPlaces.map((place) => (
                                <PublicPlaceCard
                                    key={place.id}
                                    place={place}
                                    onSaveRequest={handleSaveRequest}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </PageContainer>

            {selectedPlace && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDialog();
                        }
                    }}
                >
                    <div
                        id="save-restaurant-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="save-dialog-title"
                        aria-describedby="save-dialog-description"
                        className="w-full max-w-md rounded-2xl bg-background p-6 text-foreground shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Bookmark
                                    className="size-6"
                                    aria-hidden="true"
                                />
                            </div>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                aria-label="Close save dialog"
                                onClick={closeDialog}
                                className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </div>

                        <h2
                            id="save-dialog-title"
                            className="mt-5 text-xl font-bold"
                        >
                            {auth.user
                                ? 'Saving places is coming soon'
                                : 'Sign in to save this place'}
                        </h2>

                        <p
                            id="save-dialog-description"
                            className="mt-3 text-sm leading-6 text-muted-foreground"
                        >
                            {auth.user ? (
                                <>
                                    Saving <strong>{selectedPlace.name}</strong>{' '}
                                    will be available when the saved restaurants
                                    feature is connected.
                                </>
                            ) : (
                                <>
                                    Create an account or sign in to save{' '}
                                    <strong>{selectedPlace.name}</strong> to
                                    your personal collection.
                                </>
                            )}
                        </p>

                        {auth.user ? (
                            <button
                                type="button"
                                onClick={closeDialog}
                                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                            >
                                Got it
                            </button>
                        ) : (
                            <div className="mt-6 flex flex-col gap-3">
                                <Link
                                    href="/register"
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                >
                                    Create free account
                                </Link>

                                <Link
                                    href={login()}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand hover:bg-brand/5"
                                >
                                    Sign in
                                </Link>

                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
