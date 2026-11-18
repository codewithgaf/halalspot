import { router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

import { useSavedPlaces } from '@/contexts/saved-places-context';
import type { PublicPlace } from '@/types/halalspot/public-place';

type BookmarkAction = 'save' | 'unsave';

export function useBookmarkActions(
    onGuestRequest: (place: PublicPlace) => void,
) {
    const { auth } = usePage().props;

    const {
        savedIds,
        isLoading,
        error: collectionError,
        refreshSavedPlaces,
    } = useSavedPlaces();

    const [pendingAction, setPendingAction] = useState<{
        placeId: string;
        action: BookmarkAction;
    } | null>(null);

    const [actionError, setActionError] = useState<string | null>(null);

    // A ref prevents rapid clicks before React rerenders.
    const pendingRef = useRef(false);

    function clearActionError() {
        setActionError(null);
    }

    function handleBookmarkClick(place: PublicPlace) {
        if (!auth.user) {
            onGuestRequest(place);
            return;
        }

        if (!auth.canSavePlaces) {
            setActionError(
                'Please verify your email before saving restaurants.',
            );
            return;
        }

        if (pendingRef.current || isLoading) {
            return;
        }

        if (collectionError !== null) {
            setActionError(
                'Unable to load your saved places. Refresh the collection and try again.',
            );
            return;
        }

        const isSaved = savedIds.has(place.id);

        const action: BookmarkAction = isSaved ? 'unsave' : 'save';

        const url = `/saved-places/${encodeURIComponent(place.id)}`;

        pendingRef.current = true;
        setPendingAction({ placeId: place.id, action });
        setActionError(null);

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                // Only refresh after Laravel confirms success.
                refreshSavedPlaces();
            },

            onError: () => {
                setActionError(
                    action === 'save'
                        ? 'Unable to save this restaurant. Please try again.'
                        : 'Unable to remove this restaurant. Please try again.',
                );
            },

            onCancel: () => {
                setActionError('The bookmark request was cancelled.');
            },

            onFinish: () => {
                pendingRef.current = false;
                setPendingAction(null);
            },
        };

        if (action === 'save') {
            router.post(url, {}, options);
        } else {
            // UX-002: Unsave immediately, no confirmation.
            router.delete(url, options);
        }
    }

    return {
        handleBookmarkClick,
        pendingAction,
        actionError,
        clearActionError,
    };
}
