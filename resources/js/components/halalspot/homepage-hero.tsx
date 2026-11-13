import PageContainer from '@/components/halalspot/page-container';

export default function HomepageHero() {
    return (
        <section className="bg-brand/5 py-12 sm:py-16 lg:py-20">
            <PageContainer>
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <p className="mb-4 text-sm font-semibold tracking-wide text-brand uppercase">
                            Your halal food guide
                        </p>

                        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Find halal food{' '}
                            <span className="text-brand">
                                worth going out for.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                            Explore restaurants around you, discover new
                            flavors, and make informed choices with transparent
                            halal information.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>✓ Clear halal information</span>
                            <span>✓ Community reviews</span>
                        </div>
                    </div>

                    <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-brand/10">
                        <p className="text-sm text-brand">
                            Food photography coming next
                        </p>
                    </div>
                </div>
            </PageContainer>
        </section>
    );
}
