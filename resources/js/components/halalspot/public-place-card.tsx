import { Link, usePage } from '@inertiajs/react';
import { Bookmark, MapPin, UtensilsCrossed } from 'lucide-react';

import { useSavedPlaces } from '@/contexts/saved-places-context';
import type { PublicPlace } from '@/types/halalspot/public-place';

type PublicPlaceCardProps = {
    place: PublicPlace;
    onSaveRequest?: (place: PublicPlace) => void;
};

export default function PublicPlaceCard({
    place,
    onSaveRequest,
}: PublicPlaceCardProps) {
    const { auth } = usePage().props;
    const { savedIds, isLoading, error } = useSavedPlaces();

    const canSavePlaces = auth.canSavePlaces;
    const isSaved = canSavePlaces && savedIds.has(place.id);

    // A failed request must not be mistaken for an empty collection.
    const isBookmarkStateUnavailable =
        canSavePlaces && (isLoading || error !== null);

    const bookmarkLabel = isSaved
        ? `Unsave ${place.name}`
        : `Save ${place.name}`;

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
            <div className="relative flex aspect-video items-center justify-center bg-brand/10">
                {place.imageUrl ? (
                    <img
                        src={place.imageUrl}
                        alt={`Restaurant: ${place.name}`}
                        className="size-full object-cover"
                    />
                ) : (
                    <UtensilsCrossed
                        className="size-12 text-brand/50"
                        aria-hidden="true"
                    />
                )}

                <button
                    type="button"
                    aria-label={bookmarkLabel}
                    title={
                        isBookmarkStateUnavailable
                            ? 'Saved places are loading or unavailable'
                            : bookmarkLabel
                    }
                    aria-pressed={isSaved}
                    disabled={isBookmarkStateUnavailable}
                    onClick={() => onSaveRequest?.(place)}
                    className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-xl border border-border/70 bg-background/95 text-brand shadow-sm transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                >
                    <Bookmark
                        className="size-5"
                        fill={isSaved ? 'currentColor' : 'none'}
                        aria-hidden="true"
                    />
                </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <div>
                    <h3 className="text-lg font-bold text-foreground">
                        {place.name}
                    </h3>

                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin
                            className="size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{place.city}</span>
                    </p>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                    {place.description || 'Description not yet available.'}
                </p>

                <Link
                    href={`/restaurants/${encodeURIComponent(place.slug)}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    View details
                </Link>
            </div>
        </article>
    );
}
