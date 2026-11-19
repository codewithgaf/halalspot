import { Link } from '@inertiajs/react';
import { ArrowUpRight, Layers3, MapPin } from 'lucide-react';
import PageContainer from '@/components/halalspot/page-container';
import RestaurantSearch from '@/components/halalspot/restaurant-search';

type HomepageHeroProps = {
    appliedQuery: string;
    onSearch: (query: string) => void;
};

export default function HomepageHero({
    appliedQuery,
    onSearch,
}: HomepageHeroProps) {
    return (
        <section
            aria-labelledby="hero-heading"
            className="bg-[#f8f8f0] py-5 sm:py-8"
        >
            <PageContainer>
                {/* Main hero card */}
                <div className="relative isolate overflow-hidden rounded-[24px] bg-[#12291e] sm:rounded-[28px]">
                    {/* Chicken Piaparan photograph */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-cover bg-[position:63%_center] sm:bg-center lg:left-[35%] lg:bg-right"
                        style={{
                            backgroundImage: "url('/images/hero.webp')",
                        }}
                    />

                    {/* Mobile and tablet image overlay */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#12291e]/95 via-[#12291e]/75 to-[#12291e]/35 lg:hidden"
                    />

                    {/* Desktop gradient */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#12291e] from-[30%] via-[#12291e]/85 via-[51%] to-[#12291e]/5 lg:block"
                    />

                    {/* Hero content */}
                    <div className="relative z-10 flex min-h-[330px] flex-col justify-center px-5 py-7 sm:min-h-[370px] sm:px-10 sm:py-10 lg:min-h-[400px] lg:max-w-[62%] lg:px-12 lg:py-12">
                        {/* Location badge */}
                        <div className="inline-flex min-h-8 w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#edf5de] backdrop-blur-sm sm:text-xs">
                            <MapPin
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                            />
                            <span>Iligan City, Philippines</span>
                        </div>

                        {/* Heading */}
                        <h1
                            id="hero-heading"
                            className="mt-5 font-serif text-[clamp(2.4rem,9vw,4.75rem)] leading-[0.98] font-normal tracking-[-0.045em] text-white"
                        >
                            Find your next
                            <span className="block text-[#dcedaa] italic">
                                halal food spot.
                            </span>
                        </h1>

                        {/* Supporting description */}
                        <p className="mt-5 max-w-lg text-sm leading-6 text-[#e6eee6] sm:text-base">
                            Explore places to eat in Iligan and see the evidence
                            behind each listing.
                        </p>

                        {/* Existing accessible search functionality */}
                        <div className="mt-6 w-full max-w-[570px] min-w-0">
                            <RestaurantSearch
                                appliedQuery={appliedQuery}
                                onSearch={onSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Halal evidence information banner */}
                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[#e0e5c8] bg-[#f0f2dc] px-4 py-3 text-sm text-[#344532] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                        <Layers3
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0"
                        />

                        <p className="leading-5">
                            <strong className="font-semibold">
                                Understand halal evidence
                            </strong>
                            <span aria-hidden="true"> · </span>
                            A restaurant listing does not automatically mean
                            verified halal certification.
                        </p>
                    </div>

                    <Link
                        href="/about"
                        className="inline-flex min-h-9 shrink-0 items-center gap-1 self-start rounded-md text-xs font-semibold text-[#294c35] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#294c35]"
                    >
                        How evidence works
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Link>
                </div>
            </PageContainer>
        </section>
    );
}
