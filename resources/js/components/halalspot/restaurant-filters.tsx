import { useState } from 'react';
import CuisineFilter from '@/components/halalspot/cuisine-filter';
import HalalStatusFilter from '@/components/halalspot/halal-status-filter';
import {
    DEFAULT_RESTAURANT_FILTERS,
    type RestaurantFilters,
} from '@/types/halalspot/restaurant-filters';

export default function RestaurantFilterControls() {
    const [filters, setFilters] = useState<RestaurantFilters>({
        cuisines: [...DEFAULT_RESTAURANT_FILTERS.cuisines],
        halalStatuses: [...DEFAULT_RESTAURANT_FILTERS.halalStatuses],
    });

    function updateCuisines(cuisines: RestaurantFilters['cuisines']) {
        setFilters((previous) => ({
            ...previous,
            cuisines,
        }));
    }

    function updateHalalStatuses(
        halalStatuses: RestaurantFilters['halalStatuses'],
    ) {
        setFilters((previous) => ({
            ...previous,
            halalStatuses,
        }));
    }

    function clearFilters() {
        setFilters({
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
