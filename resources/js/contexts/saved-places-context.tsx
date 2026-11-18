import { usePage } from '@inertiajs/react';
import {
    createContext,
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
};

const SavedPlacesContext = createContext<SavedPlacesContextValue | null>(null);

type SavedPlacesProviderProps = {
    children: ReactNode;
};

export function SavedPlacesProvider({ children }: SavedPlacesProviderProps) {
    const { auth } = usePage().props;

    const userId = auth.user?.id ?? null;
    const canSavePlaces = auth.canSavePlaces;

    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        if (!userId || !canSavePlaces) {
            setSavedPlaces([]);
            setIsLoading(false);
            setError(null);

            return () => controller.abort();
        }

        async function loadSavedPlaces() {
            setIsLoading(true);
            setError(null);
            setSavedPlaces([]);

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

                if (!controller.signal.aborted) {
                    setSavedPlaces(result.data);
                }
            } catch (caughtError) {
                if (controller.signal.aborted) {
                    return;
                }

                setSavedPlaces([]);

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : 'An unexpected error occurred.',
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadSavedPlaces();

        return () => controller.abort();
    }, [userId, canSavePlaces]);

    const savedIds = useMemo(
        () => new Set(savedPlaces.map((place) => place.id)),
        [savedPlaces],
    );

    const value = useMemo(
        () => ({
            savedPlaces,
            savedIds,
            isLoading,
            error,
        }),
        [savedPlaces, savedIds, isLoading, error],
    );

    return (
        <SavedPlacesContext.Provider value={value}>
            {children}
        </SavedPlacesContext.Provider>
    );
}

export function useSavedPlaces(): SavedPlacesContextValue {
    const context = useContext(SavedPlacesContext);

    if (!context) {
        throw new Error(
            'useSavedPlaces must be used inside SavedPlacesProvider.',
        );
    }

    return context;
}
