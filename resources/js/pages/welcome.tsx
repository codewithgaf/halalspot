import { Head } from '@inertiajs/react';
import { useState } from 'react';
import HomepageHero from '@/components/halalspot/homepage-hero';
import PageContainer from '@/components/halalspot/page-container';
import RestaurantFilterControls from '@/components/halalspot/restaurant-filters';
import RestaurantResults from '@/components/halalspot/restaurant-results';
import { DEMO_RESTAURANTS } from '@/data/halalspot/demo-restaurants';
import PublicLayout from '@/layouts/public-layout';
import {
    DEFAULT_RESTAURANT_FILTERS,
    type RestaurantFilters,
} from '@/types/halalspot/restaurant-filters';

export default function Welcome() {
    const [filters, setFilters] = useState<RestaurantFilters>({
        cuisines: [...DEFAULT_RESTAURANT_FILTERS.cuisines],
        halalStatuses: [...DEFAULT_RESTAURANT_FILTERS.halalStatuses],
    });

    const filteredRestaurants = DEMO_RESTAURANTS.filter((restaurant) => {
        const matchesCuisine =
            filters.cuisines.length === 0 ||
            filters.cuisines.includes(restaurant.cuisine);

        const matchesHalalStatus =
            filters.halalStatuses.length === 0 ||
            filters.halalStatuses.includes(restaurant.halalStatus);

        return matchesCuisine && matchesHalalStatus;
    });

    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <HomepageHero />

            <PageContainer>
                <RestaurantFilterControls
                    filters={filters}
                    onChange={setFilters}
                />

                <RestaurantResults restaurants={filteredRestaurants} />
            </PageContainer>
        </PublicLayout>
    );
}
