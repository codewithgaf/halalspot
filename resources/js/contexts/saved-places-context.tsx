import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import type {
    SavedPlace,
    SavedPlacesResponse,
} from '@/types/halalspot/saved-place';

type SavedPlacesContextValue = {
    savedPlaces: SavedPlace[];
    savedIds: Set<string>;
    isLoading: boolean;
    error: string | null;
    refreshSavedPlaces: () => void;
};

type SavedPlacesState = {
    ownerKey: string | null;
    savedPlaces: SavedPlace[];
    isLoading: boolean;
    error: string | null;
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | null>(null);

type SavedPlacesProviderProps = {
    children: ReactNode;
};

export function SavedPlacesProvider({ children }: SavedPlacesProviderProps) {
    const { auth } = usePage().props;

    const userId = auth.user?.id ?? null;
    const canSavePlaces = auth.canSavePlaces;

    /**
     * Associate saved data with its authenticated owner.
     *
     * Null means no account is currently eligible to
     * access the collection.
     */
    const ownerKey = userId !== null && canSavePlaces ? String(userId) : null;

    const [state, setState] = useState<SavedPlacesState>({
        ownerKey: null,
        savedPlaces: [],
        isLoading: false,
        error: null,
    });

    const [refreshVersion, setRefreshVersion] = useState(0);

    /**
     * Expose only data belonging to the current account.
     *
     * This prevents the previous account's saved places
     * from appearing even for a single render.
     */
    const currentState: SavedPlacesState =
        state.ownerKey === ownerKey
            ? state
            : {
                  ownerKey,
                  savedPlaces: [],
                  isLoading: ownerKey !== null,
                  error: null,
              };

    /**
     * Request another server-backed collection load.
     */
    const refreshSavedPlaces = useCallback(() => {
        setRefreshVersion((previous) => previous + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        /**
         * Clear the collection when the user signs out
         * or loses access to Saved Places.
         */
        if (ownerKey === null) {
            setState({
                ownerKey: null,
                savedPlaces: [],
                isLoading: false,
                error: null,
            });

            return () => controller.abort();
        }

        async function loadSavedPlaces() {
            /**
             * Preserve previously loaded places when
             * refreshing for the same account.
             *
             * For another account, start with empty data.
             */
            setState((previous) => ({
                ownerKey,
                savedPlaces:
                    previous.ownerKey === ownerKey ? previous.savedPlaces : [],
                isLoading: true,
                error: null,
            }));

            try {
                const response = await fetch('/saved-places', {
                    method: 'GET',
                    credentials: 'same-origin',
                    cache: 'no-store',
                    headers: {
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error(
                            'Your session has expired. Please sign in again.',
                        );
                    }

                    if (response.status === 403) {
                        throw new Error(
                            'Verify your email to access saved places.',
                        );
                    }

                    throw new Error(
                        'Unable to load saved places. Please try again later.',
                    );
                }

                const result = (await response.json()) as SavedPlacesResponse;

                /**
                 * Validate the shape of the API response.
                 *
                 * TypeScript types alone cannot guarantee
                 * that incoming JSON is valid.
                 */
                if (
                    !Array.isArray(result.data) ||
                    !result.data.every(
                        (place) =>
                            typeof place.id === 'string' &&
                            typeof place.name === 'string' &&
                            typeof place.slug === 'string' &&
                            typeof place.city === 'string',
                    )
                ) {
                    throw new Error('The saved places response was invalid.');
                }

                if (controller.signal.aborted) {
                    return;
                }

                /**
                 * Replace the collection only after a
                 * successful, validated server response.
                 */
                setState({
                    ownerKey,
                    savedPlaces: result.data,
                    isLoading: false,
                    error: null,
                });
            } catch (caughtError) {
                if (controller.signal.aborted) {
                    return;
                }

                /**
                 * Preserve confirmed data after a failed
                 * refresh for the same account.
                 */
                setState((previous) => ({
                    ownerKey,
                    savedPlaces:
                        previous.ownerKey === ownerKey
                            ? previous.savedPlaces
                            : [],
                    isLoading: false,
                    error:
                        caughtError instanceof Error
                            ? caughtError.message
                            : 'An unexpected error occurred.',
                }));
            }
        }

        void loadSavedPlaces();

        /**
         * Cancel outdated requests when:
         * - The provider unmounts.
         * - The authenticated user changes.
         * - A new refresh is requested.
         */
        return () => {
            controller.abort();
        };
    }, [ownerKey, refreshVersion]);

    /**
     * Build a fast lookup for restaurant bookmark IDs.
     */
    const savedIds = useMemo(
        () => new Set(currentState.savedPlaces.map((place) => place.id)),
        [currentState.savedPlaces],
    );

    /**
     * Share the current account's saved collection.
     */
    const value = useMemo<SavedPlacesContextValue>(
        () => ({
            savedPlaces: currentState.savedPlaces,
            savedIds,
            isLoading: currentState.isLoading,
            error: currentState.error,
            refreshSavedPlaces,
        }),
        [
            currentState.savedPlaces,
            currentState.isLoading,
            currentState.error,
            savedIds,
            refreshSavedPlaces,
        ],
    );

    return (
        <SavedPlacesContext.Provider value={value}>
            {children}
        </SavedPlacesContext.Provider>
    );
}

/**
 * Read Saved Places state from components rendered
 * inside SavedPlacesProvider.
 */
export function useSavedPlaces(): SavedPlacesContextValue {
    const context = useContext(SavedPlacesContext);

    if (!context) {
        throw new Error(
            'useSavedPlaces must be used inside SavedPlacesProvider.',
        );
    }

    return context;
}
