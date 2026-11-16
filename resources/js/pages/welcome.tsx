import { Head } from '@inertiajs/react';
import { useState } from 'react';
import HomepageHero from '@/components/halalspot/homepage-hero';
import PageContainer from '@/components/halalspot/page-container';
import PublicPlaceCard from '@/components/halalspot/public-place-card';
import PublicLayout from '@/layouts/public-layout';
import type { PublicPlace } from '@/types/halalspot/public-place';

type WelcomeProps = {
    places: PublicPlace[];
};

export default function Welcome({ places }: WelcomeProps) {
    const [searchQuery, setSearchQuery] = useState('');

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
                                <PublicPlaceCard key={place.id} place={place} />
                            ))}
                        </div>
                    )}
                </section>
            </PageContainer>
        </PublicLayout>
    );
}
