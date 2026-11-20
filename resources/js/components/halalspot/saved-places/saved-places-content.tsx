import { Link } from '@inertiajs/react';
import { Bookmark, RefreshCw } from 'lucide-react';

import SavedPlacesList from '@/components/halalspot/saved-places/saved-places-list';
import { login } from '@/routes';
import type { SavedPlace } from '@/types/halalspot/saved-place';

type SavedPlacesContentProps = {
    isGuest: boolean;
    savedPlaces: SavedPlace[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
    onClose: (restoreFocus?: boolean) => void;
};

export default function SavedPlacesContent({
    isGuest,
    savedPlaces,
    isLoading,
    error,
    onRefresh,
    onClose,
}: SavedPlacesContentProps) {
    const savedCount = savedPlaces.length;
    const hasSavedPlaces = savedCount > 0;

    if (isGuest) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <Bookmark className="size-6" aria-hidden="true" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                        Keep your favorite places
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Sign in or create an account to save restaurants and
                        revisit them later.
                    </p>
                </div>

                <Link
                    href={login()}
                    onClick={() => onClose(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                    Sign in
                </Link>

                <Link
                    href="/register"
                    onClick={() => onClose(false)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand hover:bg-brand/5"
                >
                    Create free account
                </Link>
            </div>
        );
    }

    // The current provider does not yet distinguish
    // initial loading from an empty collection refresh.
    if (isLoading && !hasSavedPlaces) {
        return (
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
        );
    }

    return (
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
                    onClick={onRefresh}
                    disabled={isLoading}
                    aria-label="Refresh saved places"
                    title="Refresh saved places"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw className="size-4" aria-hidden="true" />
                </button>
            </div>

            {/* Keep confirmed places visible after refresh errors */}
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
                            Showing your last successfully loaded collection.
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onRefresh}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                        <RefreshCw className="size-4" aria-hidden="true" />
                        Try again
                    </button>
                </div>
            )}

            {!hasSavedPlaces ? (
                !error && (
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
                                Tap the bookmark icon on a restaurant to add it
                                to your collection.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                            Explore restaurants
                        </button>
                    </div>
                )
            ) : (
                <SavedPlacesList
                    places={savedPlaces}
                    onNavigate={() => onClose(false)}
                />
            )}
        </div>
    );
}
