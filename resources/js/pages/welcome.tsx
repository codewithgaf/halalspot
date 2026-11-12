import { Head } from '@inertiajs/react';
import PageContainer from '@/components/halalspot/page-container';
import PublicLayout from '@/layouts/public-layout';

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <section className="py-16">
                <PageContainer>
                    <h1 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
                        Find your next halal spot.
                    </h1>

                    <p className="mt-4 max-w-2xl text-muted-foreground">
                        Discover halal restaurants and explore their
                        accreditation information with confidence.
                    </p>
                </PageContainer>
            </section>
        </PublicLayout>
    );
}
