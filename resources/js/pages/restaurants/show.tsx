import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, UtensilsCrossed } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import type { PlaceDetail } from '@/types/halalspot/place-detail';

type RestaurantShowProps = {
    place: PlaceDetail;
};

export default function RestaurantShow({ place }: RestaurantShowProps) {
    const location = [
        place.address,
        place.city,
        place.province,
        place.countryCode,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <PublicLayout>
            <Head title={place.name} />

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to restaurants
                </Link>

                <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                    <div className="flex aspect-video items-center justify-center bg-brand/10 sm:aspect-21/9">
                        {place.imageUrl ? (
                            <img
                                src={place.imageUrl}
                                alt={`Restaurant: ${place.name}`}
                                className="size-full object-cover"
                            />
                        ) : (
                            <UtensilsCrossed
                                className="size-16 text-brand/50"
                                aria-hidden="true"
                            />
                        )}
                    </div>

                    <div className="space-y-8 p-5 sm:p-8">
                        <header>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {place.name}
                            </h1>

                            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground sm:text-base">
                                <MapPin
                                    className="mt-0.5 size-5 shrink-0"
                                    aria-hidden="true"
                                />
                                <span>{location}</span>
                            </p>
                        </header>

                        <section aria-labelledby="about-heading">
                            <h2
                                id="about-heading"
                                className="text-xl font-semibold text-foreground"
                            >
                                About this restaurant
                            </h2>

                            <p className="mt-3 leading-7 text-muted-foreground">
                                {place.description ||
                                    'Description not yet available.'}
                            </p>
                        </section>
                    </div>
                </article>
            </main>
        </PublicLayout>
    );
}
