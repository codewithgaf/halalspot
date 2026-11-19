import { Link } from '@inertiajs/react';
import { Bookmark, MapPin, UtensilsCrossed } from 'lucide-react';

import type { SavedPlace } from '@/types/halalspot/saved-place';

type SavedPlacesListProps = {
    places: SavedPlace[];
    onNavigate: () => void;
};

export default function SavedPlacesList({
    places,
    onNavigate,
}: SavedPlacesListProps) {
    return (
        <ul className="space-y-2">
            {places.map((place) => (
                <li key={place.id}>
                    <Link
                        href={`/restaurants/${encodeURIComponent(place.slug)}`}
                        onClick={onNavigate}
                        className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                            <UtensilsCrossed
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {place.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />

                                <span className="truncate">{place.city}</span>
                            </p>
                        </div>

                        <Bookmark
                            className="size-4 shrink-0 fill-current text-brand"
                            aria-hidden="true"
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
