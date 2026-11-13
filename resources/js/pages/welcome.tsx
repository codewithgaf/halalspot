import { Head } from '@inertiajs/react';
import HomepageHero from '@/components/halalspot/homepage-hero';
import PublicLayout from '@/layouts/public-layout';
import PageContainer from '@/components/halalspot/page-container';
import RestaurantFilterControls from '@/components/halalspot/restaurant-filters';

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <HomepageHero />
            <PageContainer>
                <RestaurantFilterControls />
            </PageContainer>
        </PublicLayout>
    );
}
