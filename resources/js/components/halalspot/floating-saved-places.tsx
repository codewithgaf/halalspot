import { Link, usePage } from '@inertiajs/react';
import { Heart, Bookmark, LockKeyhole, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { home, login } from '@/routes';

export default function FloatingSavedPlaces() {
    const { auth } = usePage().props;
    const isAuthenticated = auth.user !== null;

    const [isOpen, setIsOpen] = useState(false);

    const panelId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    function closePanel(restoreFocus = false) {
        setIsOpen(false);

        if (restoreFocus) {
            triggerRef.current?.focus();
        }
    }

    function togglePanel() {
        setIsOpen((previous) => !previous);
    }

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
        >
            {isOpen && (
                <section
                    id={panelId}
                    aria-label="Saved places"
                    className="w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold">
                                Saved places
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Your restaurant collection
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label="Close saved places"
                            onClick={() => closePanel(true)}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    </div>

                    <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                            {isAuthenticated ? (
                                <Heart
                                    aria-hidden="true"
                                    className="size-6"
                                />
                            ) : (
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="size-6"
                                />
                            )}
                        </span>

                        <p className="mt-3 text-sm font-semibold">
                            {isAuthenticated
                                ? 'Saved places coming soon'
                                : 'Save places you love'}
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {isAuthenticated
                                ? 'Your saved restaurant collection will be available when this feature is implemented.'
                                : 'Create an account or sign in to build your own collection of restaurants.'}
                        </p>
                    </div>

                    {isAuthenticated ? (
                        <Link
                            href={home()}
                            onClick={() => closePanel()}
                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Explore restaurants
                        </Link>
                    ) : (
                        <div className="mt-4 flex flex-col gap-2">
                            <Link
                                href="/register"
                                onClick={() => closePanel()}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                Create free account
                            </Link>

                            <Link
                                href={login()}
                                onClick={() => closePanel()}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                                Sign in
                            </Link>
                        </div>
                    )}
                </section>
            )}

            <button
                ref={triggerRef}
                type="button"
                aria-label={isOpen ? 'Close saved places' : 'Open saved places'}
                title="Saved places"
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                onClick={togglePanel}
                className="flex size-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none"
            >
                <Heart aria-hidden="true" className="size-6" />
            </button>
        </div>
    );
}
