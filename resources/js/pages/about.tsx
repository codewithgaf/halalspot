import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';

export default function About() {
    return (
        <PublicLayout>
            <Head title="About HalalSpot" />

            <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <p className="text-sm font-semibold text-brand">Our mission</p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    Discover food. Support communities.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                    HalalSpot helps people discover restaurants, understand the
                    evidence supporting halal claims, and support local
                    communities, starting in Iligan City.
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                    A restaurant listing does not automatically mean it has
                    verified halal certification. We distinguish documented
                    certification, self-declared claims, and unknown status.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
                >
                    Explore restaurants
                </Link>
            </section>
        </PublicLayout>
    );
}
