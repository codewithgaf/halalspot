import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Discover Halal Places" />

            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
                    Find your next halal spot.
                </h1>

                <p className="mt-4 max-w-2xl text-muted-foreground">
                    Discover halal restaurants and explore their accreditation
                    information with confidence.
                </p>
            </section>
        </PublicLayout>
    );
}
