import { usePage } from '@inertiajs/react';
import { Bookmark, X } from 'lucide-react';

import SavedPlacesContent from '@/components/halalspot/saved-places/saved-places-content';
import { useSavedPlaces } from '@/contexts/saved-places-context';
import { useFloatingPanel } from '@/hooks/halalspot/use-floating-panel';

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
                        <SavedPlacesContent
                            isGuest={isGuest}
                            isUnverified={isUnverified}
                            savedPlaces={savedPlaces}
                            isLoading={isLoading}
                            error={error}
                            onRefresh={refreshSavedPlaces}
                            onClose={closePanel}
                        />
                    </div>
                </aside>
            )}
        </div>
    );
}
