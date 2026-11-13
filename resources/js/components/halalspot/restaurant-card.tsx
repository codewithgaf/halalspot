import { Heart, MapPin, UtensilsCrossed } from 'lucide-react';
import type { Restaurant } from '@/types/halalspot/restaurant';

type RestaurantCardProps = {
    restaurant: Restaurant;
    onSaveRequest?: (restaurant: Restaurant) => void;
};

const HALAL_BADGE_STYLES = {
    verified_certification: 'border-green-200 bg-green-50 text-green-800',
    self_declared: 'border-amber-200 bg-amber-50 text-amber-800',
    unknown: 'border-gray-200 bg-gray-100 text-gray-700',
} as const;

const HALAL_BADGE_LABELS = {
    verified_certification: 'Verified certification',
    self_declared: 'Self-declared halal',
    unknown: 'Unknown status',
} as const;

export default function RestaurantCard({
    restaurant,
    onSaveRequest,
}: RestaurantCardProps) {
    const badgeStyle = HALAL_BADGE_STYLES[restaurant.halalStatus];
    const badgeLabel = HALAL_BADGE_LABELS[restaurant.halalStatus];

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="flex aspect-video items-center justify-center bg-brand/10">
                {restaurant.imageUrl ? (
                    <img
                        src={restaurant.imageUrl}
                        alt={`Food at ${restaurant.name}`}
                        className="size-full object-cover"
                    />
                ) : (
                    <UtensilsCrossed
                        className="size-12 text-brand/50"
                        aria-hidden="true"
                    />
                )}
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                            {restaurant.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span>
                                {restaurant.city} · {restaurant.cuisine}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onSaveRequest?.(restaurant)}
                        aria-label={`Save ${restaurant.name}`}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-brand px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <Heart className="size-4" aria-hidden="true" />
                        <span>Save</span>
                    </button>
                </div>

                <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}
                >
                    {badgeLabel}
                </span>

                <p className="text-sm leading-6 text-muted-foreground">
                    {restaurant.description}
                </p>
            </div>
        </article>
    );
}
