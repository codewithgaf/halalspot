import { Head } from '@inertiajs/react';
import HomepageHero from '@/components/halalspot/homepage-hero';
import PublicLayout from '@/layouts/public-layout';

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <HomepageHero />
        </PublicLayout>
    );
}
