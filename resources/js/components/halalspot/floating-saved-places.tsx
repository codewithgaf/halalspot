import { Link, usePage } from '@inertiajs/react';
import { Bookmark, MapPin, RefreshCw, UtensilsCrossed, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useSavedPlaces } from '@/contexts/saved-places-context';
import { login } from '@/routes';

export default function FloatingSavedPlaces() {
    const { auth } = usePage().props;

    const { savedPlaces, isLoading, error, refreshSavedPlaces } =
        useSavedPlaces();

    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);

    const isGuest = auth.user === null;
    const isUnverified = !isGuest && !auth.canSavePlaces;

    const savedCount = savedPlaces.length;

    /**
     * Close the panel and restore focus to its trigger.
     */
    function closePanel() {
        setIsOpen(false);
        triggerRef.current?.focus();
    }

    /**
     * Manage keyboard and outside-click behavior.
     *
     * This is a non-modal panel, so users can still
     * interact with the rest of the page.
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        closeRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                panelRef.current?.contains(target) ||
                triggerRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
        }

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isOpen]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50">
            {/* Floating bookmark trigger */}
            <button
                ref={triggerRef}
                type="button"
                aria-label={isOpen ? 'Close saved places' : 'Open saved places'}
                aria-expanded={isOpen}
                aria-controls="floating-saved-places-panel"
                onClick={() => {
                    setIsOpen((previous) => !previous);
                }}
                className="pointer-events-auto absolute right-4 bottom-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none sm:right-6 sm:bottom-6"
            >
                <Bookmark className="size-6" aria-hidden="true" />

                {!isGuest && savedCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-2 -right-2 flex min-w-6 items-center justify-center rounded-full border-2 border-background bg-foreground px-1 text-xs font-semibold text-background"
                    >
                        {savedCount > 99 ? '99+' : savedCount}
                    </span>
                )}
            </button>

            {/* Saved Places collection panel */}
            {isOpen && (
                <aside
                    ref={panelRef}
                    id="floating-saved-places-panel"
                    aria-label="Saved places"
                    className="pointer-events-auto absolute right-4 bottom-20 flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl sm:right-6 sm:bottom-24"
                >
                    {/* Panel header */}
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Saved places
                            </h2>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Your restaurant collection
                            </p>
                        </div>

                        <button
                            ref={closeRef}
                            type="button"
                            onClick={closePanel}
                            aria-label="Close saved places panel"
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="min-h-0 overflow-y-auto p-4">
                        {/* Guest state */}
                        {isGuest ? (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                                        <Bookmark
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <h3 className="mt-4 text-sm font-semibold">
                                        Keep your favorite places
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                        Sign in or create an account to save
                                        restaurants and revisit them later.
                                    </p>
                                </div>

                                <Link
                                    href={login()}
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                >
                                    Sign in
                                </Link>

                                <Link
                                    href="/register"
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                >
                                    Create free account
                                </Link>
                            </div>
                        ) : isUnverified ? (
                            /* Email verification required */
                            <div className="space-y-4 text-center">
                                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                                    <Bookmark
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Verify your email
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                        Verify your email address before
                                        accessing your saved restaurants.
                                    </p>
                                </div>

                                <Link
                                    href="/email/verify"
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                >
                                    Verify email
                                </Link>
                            </div>
                        ) : isLoading ? (
                            /* Loading state */
                            <div
                                role="status"
                                className="flex flex-col items-center justify-center gap-3 py-10 text-center"
                            >
                                <RefreshCw
                                    className="size-7 animate-spin text-brand motion-reduce:animate-none"
                                    aria-hidden="true"
                                />

                                <p className="text-sm text-muted-foreground">
                                    Loading saved places...
                                </p>
                            </div>
                        ) : error ? (
                            /* Failed request */
                            <div
                                role="alert"
                                className="space-y-4 py-6 text-center"
                            >
                                <h3 className="text-sm font-semibold">
                                    Unable to load saved places
                                </h3>

                                <p className="text-xs leading-5 text-muted-foreground">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={refreshSavedPlaces}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                >
                                    <RefreshCw
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Try again
                                </button>
                            </div>
                        ) : savedCount === 0 ? (
                            /* Empty collection */
                            <div className="space-y-4 text-center">
                                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-7">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                                        <Bookmark
                                            className="size-6"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <h3 className="mt-4 text-sm font-semibold">
                                        No saved places yet
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                        Tap the bookmark icon on a restaurant to
                                        add it to your collection.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closePanel}
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                >
                                    Explore restaurants
                                </button>
                            </div>
                        ) : (
                            /* Real saved restaurant collection */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p
                                        className="text-xs font-medium text-muted-foreground"
                                        aria-live="polite"
                                    >
                                        {savedCount}{' '}
                                        {savedCount === 1
                                            ? 'saved restaurant'
                                            : 'saved restaurants'}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={refreshSavedPlaces}
                                        aria-label="Refresh saved places"
                                        title="Refresh saved places"
                                        className="inline-flex size-11 items-center justify-center rounded-lg text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                    >
                                        <RefreshCw
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                <ul className="space-y-2">
                                    {savedPlaces.map((place) => (
                                        <li key={place.id}>
                                            <Link
                                                href={`/restaurants/${encodeURIComponent(place.slug)}`}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                }}
                                                className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                                            >
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                                    <UtensilsCrossed
                                                        className="size-5"
                                                        aria-hidden="true"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {place.name}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin
                                                            className="size-3.5 shrink-0"
                                                            aria-hidden="true"
                                                        />

                                                        <span className="truncate">
                                                            {place.city}
                                                        </span>
                                                    </p>
                                                </div>

                                                <Bookmark
                                                    className="size-4 shrink-0 fill-current text-brand"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
    );
}
