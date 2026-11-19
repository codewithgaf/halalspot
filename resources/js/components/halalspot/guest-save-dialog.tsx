import { Link } from '@inertiajs/react';
import { Bookmark, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { login } from '@/routes';
import type { PublicPlace } from '@/types/halalspot/public-place';

type GuestSaveDialogProps = {
    place: PublicPlace;
    onClose: () => void;
};

export default function GuestSaveDialog({
    place,
    onClose,
}: GuestSaveDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        closeButtonRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            const dialog = dialogRef.current;

            if (!dialog) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusable = Array.from(
                dialog.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled])',
                ),
            );

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (!first || !last) {
                event.preventDefault();
                return;
            }

            if (
                event.shiftKey &&
                (document.activeElement === first ||
                    !dialog.contains(document.activeElement))
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === last ||
                    !dialog.contains(document.activeElement))
            ) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            previouslyFocused?.focus();
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="guest-save-title"
                aria-describedby="guest-save-description"
                className="w-full max-w-md rounded-2xl bg-background p-6 text-foreground shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Bookmark className="size-6" aria-hidden="true" />
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        aria-label="Close save dialog"
                        onClick={onClose}
                        className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <X className="size-5" aria-hidden="true" />
                    </button>
                </div>

                <h2 id="guest-save-title" className="mt-5 text-xl font-bold">
                    Sign in to save this place
                </h2>

                <p
                    id="guest-save-description"
                    className="mt-3 text-sm leading-6 text-muted-foreground"
                >
                    Create an account or sign in to save{' '}
                    <strong>{place.name}</strong> to your personal collection.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <Link
                        href="/register"
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                        Create free account
                    </Link>

                    <Link
                        href={login()}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-brand hover:bg-brand/5"
                    >
                        Sign in
                    </Link>

                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
