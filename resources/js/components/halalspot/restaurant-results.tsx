import RestaurantCard from '@/components/halalspot/restaurant-card';
import type { Restaurant } from '@/types/halalspot/restaurant';

type RestaurantResultsProps = {
    restaurants: Restaurant[];
    onSaveRequest?: (restaurant: Restaurant) => void;
};

export default function RestaurantResults({
    restaurants,
    onSaveRequest,
}: RestaurantResultsProps) {
    return (
        <section aria-label="Restaurant results" className="py-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">
                    Restaurants
                </h2>

                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {restaurants.length}{' '}
                    {restaurants.length === 1 ? 'restaurant' : 'restaurants'}{' '}
                    found
                </p>
            </div>

            {restaurants.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background px-6 py-12 text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                        No restaurants found
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try changing or clearing your filters.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            onSaveRequest={onSaveRequest}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
