import CuisineFilter from '@/components/halalspot/cuisine-filter';
import HalalStatusFilter from '@/components/halalspot/halal-status-filter';
import type { RestaurantFilters } from '@/types/halalspot/restaurant-filters';

type RestaurantFilterControlsProps = {
    filters: RestaurantFilters;
    onChange: (filters: RestaurantFilters) => void;
};

export default function RestaurantFilterControls({
    filters,
    onChange,
}: RestaurantFilterControlsProps) {
    function updateCuisines(cuisines: RestaurantFilters['cuisines']) {
        onChange({
            ...filters,
            cuisines,
        });
    }

    function updateHalalStatuses(
        halalStatuses: RestaurantFilters['halalStatuses'],
    ) {
        onChange({
            ...filters,
            halalStatuses,
        });
    }

    function clearFilters() {
        onChange({
            cuisines: [],
            halalStatuses: [],
        });
    }

    return (
        <section aria-label="Restaurant filters" className="space-y-5 py-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Explore restaurants
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Find your next favorite halal-friendly place.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="shrink-0 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    Clear filters
                </button>
            </div>

            <CuisineFilter
                selected={filters.cuisines}
                onChange={updateCuisines}
            />

            <HalalStatusFilter
                selected={filters.halalStatuses}
                onChange={updateHalalStatuses}
            />
        </section>
    );
}
