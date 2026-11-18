import { Link, usePage } from '@inertiajs/react';
import { Bookmark, RefreshCw, X } from 'lucide-react';

import SavedPlacesList from '@/components/halalspot/saved-places/saved-places-list';
import { useSavedPlaces } from '@/contexts/saved-places-context';
import { useFloatingPanel } from '@/hooks/halalspot/use-floating-panel';
import { login } from '@/routes';

export default function FloatingSavedPlaces() {
    const { auth } = usePage().props;

    const { savedPlaces, isLoading, error, refreshSavedPlaces } =
        useSavedPlaces();

    const { isOpen, togglePanel, closePanel, triggerRef, closeRef, panelRef } =
        useFloatingPanel();

    const isGuest = auth.user === null;
    const isUnverified = !isGuest && !auth.canSavePlaces;

    const savedCount = savedPlaces.length;
    const hasSavedPlaces = savedCount > 0;

    return (
        <div className="pointer-events-none fixed inset-0 z-50">
            {/* Floating bookmark button */}
            <button
                ref={triggerRef}
                type="button"
                aria-label={isOpen ? 'Close saved places' : 'Open saved places'}
                aria-expanded={isOpen}
                aria-controls={
                    isOpen ? 'floating-saved-places-panel' : undefined
                }
                onClick={togglePanel}
                className="pointer-events-auto absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] inline-flex size-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none sm:right-6 sm:bottom-6"
            >
                <Bookmark className="size-6" aria-hidden="true" />

                {!isGuest && !isUnverified && hasSavedPlaces && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-2 -right-2 flex min-w-6 items-center justify-center rounded-full border-2 border-background bg-foreground px-1 text-xs font-semibold text-background"
                    >
                        {savedCount > 99 ? '99+' : savedCount}
                    </span>
                )}
            </button>

            {/* Saved Places panel */}
            {isOpen && (
                <aside
                    ref={panelRef}
                    id="floating-saved-places-panel"
                    aria-label="Saved places"
                    className="pointer-events-auto absolute right-4 bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))] flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl sm:right-6 sm:bottom-24"
                >
                    {/* Header */}
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
                            aria-label="Close saved places panel"
                            onClick={() => closePanel()}
                            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Scrollable panel content */}
                    <div className="min-h-0 overflow-y-auto p-4">
                        {isGuest ? (
                            /* Guest state */
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
                                    onClick={() => closePanel(false)}
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                                >
                                    Sign in
                                </Link>

                                <Link
                                    href="/register"
                                    onClick={() => closePanel(false)}
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand hover:bg-brand/5"
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
                                    onClick={() => closePanel(false)}
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                >
                                    Verify email
                                </Link>
                            </div>
                        ) : isLoading && !hasSavedPlaces ? (
                            /* Initial loading or refreshing an empty collection */
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
                        ) : (
                            /* Collection, error, and empty states */
                            <div className="space-y-4">
                                {/* Collection count and refresh */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p
                                            className="text-xs font-medium text-muted-foreground"
                                            aria-live="polite"
                                        >
                                            {savedCount}{' '}
                                            {savedCount === 1
                                                ? 'saved restaurant'
                                                : 'saved restaurants'}
                                        </p>

                                        {isLoading && (
                                            <p
                                                role="status"
                                                className="mt-1 flex items-center gap-2 text-xs text-brand"
                                            >
                                                <RefreshCw
                                                    className="size-3.5 animate-spin motion-reduce:animate-none"
                                                    aria-hidden="true"
                                                />
                                                Refreshing...
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={refreshSavedPlaces}
                                        disabled={isLoading}
                                        aria-label="Refresh saved places"
                                        title="Refresh saved places"
                                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <RefreshCw
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                {/* Error with retained collection */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3"
                                    >
                                        <p className="text-sm font-semibold text-destructive">
                                            Unable to refresh saved places
                                        </p>

                                        <p className="text-xs leading-5 text-destructive">
                                            {error}
                                        </p>

                                        {hasSavedPlaces && (
                                            <p className="text-xs text-muted-foreground">
                                                Showing your last successfully
                                                loaded collection.
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={refreshSavedPlaces}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                                        >
                                            <RefreshCw
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {!hasSavedPlaces ? (
                                    !error && (
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
                                                    Tap the bookmark icon on a
                                                    restaurant to add it to your
                                                    collection.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => closePanel()}
                                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                                            >
                                                Explore restaurants
                                            </button>
                                        </div>
                                    )
                                ) : (
                                    /* Saved restaurant list */
                                    <SavedPlacesList
                                        places={savedPlaces}
                                        onNavigate={() => closePanel(false)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
    );
}
