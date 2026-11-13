import { ChevronDown, LocateFixed, MapPin } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type Coordinates = {
    latitude: number;
    longitude: number;
};

type AppliedLocation = {
    city: string;
    radius: number;
    coordinates: Coordinates | null;
};

export default function LocationSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [city, setCity] = useState('');
    const [radius, setRadius] = useState(10);
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [location, setLocation] = useState<AppliedLocation | null>(null);

    const requestRef = useRef(0);
    const panelId = useId();
    const cityId = useId();
    const radiusId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    function invalidateLocationRequest() {
        requestRef.current += 1;
        setLocating(false);
    }

    function closePanel(restoreFocus = false) {
        invalidateLocationRequest();
        setIsOpen(false);
        if (restoreFocus) triggerRef.current?.focus();
    }

    function togglePanel() {
        if (isOpen) {
            closePanel();
            return;
        }

        invalidateLocationRequest();
        setCity(location?.coordinates ? '' : (location?.city ?? ''));
        setCoordinates(location?.coordinates ?? null);
        setRadius(location?.radius ?? 10);
        setLocationError('');
        setIsOpen(true);
    }

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                closePanel();
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closePanel(true);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            requestRef.current += 1;
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    function useCurrentLocation() {
        if (locating) return;

        if (!navigator.geolocation) {
            setLocationError(
                'Your browser does not support location access. Enter a city instead.',
            );
            return;
        }

        const request = ++requestRef.current;
        setLocating(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                if (request !== requestRef.current) return;

                setCoordinates({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                setCity('');
                setLocating(false);
            },
            (error) => {
                if (request !== requestRef.current) return;

                setLocating(false);
                setLocationError(
                    error.code === 1
                        ? 'Location access was denied. Allow it in your browser or enter a city.'
                        : 'Unable to find your location. Try again or enter a city.',
                );
            },
            { timeout: 10000, maximumAge: 60000 },
        );
    }

    const locationLabel = location
        ? `${location.city}, within ${location.radius} km`
        : 'Set location';

    return (
        <div
            ref={containerRef}
            className="relative shrink-0"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    closePanel();
                }
            }}
        >
            <button
                ref={triggerRef}
                type="button"
                aria-label={locationLabel}
                title={locationLabel}
                aria-expanded={isOpen}
                aria-controls={isOpen ? panelId : undefined}
                onClick={togglePanel}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none sm:min-w-44 sm:px-4"
            >
                <MapPin
                    aria-hidden="true"
                    className="size-5 shrink-0 text-brand"
                />
                <span className="hidden max-w-40 truncate sm:inline">
                    {location
                        ? `${location.city} · ${location.radius} km`
                        : 'Set location'}
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className={`hidden size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none sm:block ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    id={panelId}
                    role="region"
                    aria-label="Location options"
                    className="absolute top-full right-0 z-20 mt-2 max-h-80 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-lg"
                >
                    <p className="font-medium text-foreground">
                        Find food nearby
                    </p>

                    <form
                        className="mt-4 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if ((!city.trim() && !coordinates) || locating)
                                return;

                            setLocation({
                                city: coordinates
                                    ? 'Current location'
                                    : city.trim(),
                                radius,
                                coordinates,
                            });
                            closePanel(true);
                        }}
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor={cityId}
                                className="text-sm font-medium text-foreground"
                            >
                                City or area
                            </label>
                            <input
                                id={cityId}
                                name="city"
                                type="text"
                                autoComplete="address-level2"
                                placeholder="Enter your city or area"
                                required={!coordinates}
                                maxLength={100}
                                value={city}
                                onChange={(event) => {
                                    invalidateLocationRequest();
                                    setCoordinates(null);
                                    setLocationError('');
                                    setCity(event.target.value);
                                }}
                                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-brand"
                            />
                            <button
                                type="button"
                                onClick={useCurrentLocation}
                                aria-disabled={locating}
                                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-brand hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-disabled:cursor-wait aria-disabled:opacity-50"
                            >
                                <LocateFixed
                                    aria-hidden="true"
                                    className="size-4 shrink-0"
                                />
                                {locating
                                    ? 'Finding your location…'
                                    : 'Use my current location'}
                            </button>
                            {coordinates && (
                                <p
                                    role="status"
                                    className="text-sm text-muted-foreground"
                                >
                                    Current location selected.
                                </p>
                            )}
                            {locationError && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {locationError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <label
                                    htmlFor={radiusId}
                                    className="text-sm font-medium text-foreground"
                                >
                                    Search radius
                                </label>
                                <output
                                    htmlFor={radiusId}
                                    className="text-sm font-medium text-brand"
                                >
                                    {radius} km
                                </output>
                            </div>
                            <input
                                id={radiusId}
                                name="radius"
                                type="range"
                                min={1}
                                max={50}
                                step={1}
                                value={radius}
                                aria-valuetext={`${radius} ${radius === 1 ? 'kilometer' : 'kilometers'}`}
                                onChange={(event) =>
                                    setRadius(Number(event.target.value))
                                }
                                className="h-6 w-full cursor-pointer accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            />
                            <div
                                className="flex justify-between text-xs text-muted-foreground"
                                aria-hidden="true"
                            >
                                <span>1 km</span>
                                <span>50 km</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                (!city.trim() && !coordinates) || locating
                            }
                            className="h-11 w-full rounded-xl bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Apply location
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
