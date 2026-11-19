import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import GuestSaveDialog from '@/components/halalspot/guest-save-dialog';
import HomepageHero from '@/components/halalspot/homepage-hero';
import PageContainer from '@/components/halalspot/page-container';
import PublicPlaceCard from '@/components/halalspot/public-place-card';
import { useBookmarkActions } from '@/hooks/halalspot/use-bookmark-actions';
import PublicLayout from '@/layouts/public-layout';
import type { PublicPlace } from '@/types/halalspot/public-place';

type WelcomeProps = {
    places: PublicPlace[];
};

/**
 * PublicLayout mounts SavedPlacesProvider.
 *
 * WelcomeContent is its child, so it can safely
 * use the bookmark actions hook.
 */
export default function Welcome({ places }: WelcomeProps) {
    return (
        <PublicLayout>
            <WelcomeContent places={places} />
        </PublicLayout>
    );
}

function WelcomeContent({ places }: WelcomeProps) {
    const { auth } = usePage().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [guestPlace, setGuestPlace] = useState<PublicPlace | null>(null);

    const closeGuestDialog = useCallback(() => {
        setGuestPlace(null);
    }, []);

    const {
        handleBookmarkClick,
        pendingAction,
        actionError,
        clearActionError,
    } = useBookmarkActions(setGuestPlace);

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

    return (
        <>
            <Head title="Discover Halal Places" />

            <HomepageHero
                appliedQuery={searchQuery}
                onSearch={setSearchQuery}
            />

            <PageContainer>
                <section aria-label="Restaurant results" className="py-8">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

                    {actionError && (
                        <div
                            role="alert"
                            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                        >
                            <p>{actionError}</p>

                            <button
                                type="button"
                                onClick={clearActionError}
                                className="mt-2 min-h-11 font-semibold underline underline-offset-4"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {auth.user && !auth.canSavePlaces && (
                        <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground">
                            <p>
                                Verify your email address to start saving
                                restaurants to your collection.
                            </p>

                            <Link
                                href="/email/verify"
                                className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-4"
                            >
                                Verify email
                            </Link>
                        </div>
                    )}

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
                                    onSaveRequest={handleBookmarkClick}
                                    isPending={
                                        pendingAction?.placeId === place.id
                                    }
                                    isBookmarkDisabled={pendingAction !== null}
                                />
                            ))}
                        </div>
                    )}

                    {pendingAction && (
                        <p
                            role="status"
                            aria-live="polite"
                            className="mt-4 text-sm text-muted-foreground"
                        >
                            {pendingAction.action === 'save'
                                ? 'Saving restaurant...'
                                : 'Removing restaurant...'}
                        </p>
                    )}
                </section>
            </PageContainer>

            {guestPlace && (
                <GuestSaveDialog
                    place={guestPlace}
                    onClose={closeGuestDialog}
                />
            )}
        </>
    );
}
