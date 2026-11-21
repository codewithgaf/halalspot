import { useEffect, useId, useRef, useState } from 'react';
import { LoaderCircle, MapPin, Search, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type City = {
    code: string;
    name: string;
    region: string;
    province: string | null;
};

type Props = {
    initialCity: City | null;
    error?: string;
};

type CitySearchResponse = {
    data: City[];
};

function formatCityName(name: string): string {
    if (name.startsWith('City of ')) {
        return `${name.slice(8)} City`;
    }

    return name;
}

function formatLocation(city: City): string {
    return [city.province, city.region, 'Philippines']
        .filter(Boolean)
        .join(', ');
}

export default function LocalityAutocomplete({ initialCity, error }: Props) {
    const listboxId = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    const [selectedCity, setSelectedCity] = useState<City | null>(initialCity);

    const [query, setQuery] = useState(
        initialCity ? formatCityName(initialCity.name) : '',
    );

    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const trimmedQuery = query.trim();

    const showDropdown = isOpen && trimmedQuery.length >= 2;

    useEffect(() => {
        if (!isOpen || trimmedQuery.length < 2) {
            return;
        }

        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            setLoading(true);
            setSearchError(false);

            try {
                const params = new URLSearchParams({
                    q: trimmedQuery,
                });

                const response = await fetch(
                    `/settings/localities/search?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                        credentials: 'same-origin',
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error('City search failed');
                }

                const result = (await response.json()) as CitySearchResponse;

                if (!Array.isArray(result.data)) {
                    throw new Error('Invalid city response');
                }

                if (!controller.signal.aborted) {
                    setSuggestions(result.data);
                    setActiveIndex(-1);
                    setHasSearched(true);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setSuggestions([]);
                    setSearchError(true);
                    setHasSearched(true);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [trimmedQuery, isOpen]);

    function handleQueryChange(value: string) {
        setQuery(value);
        setSuggestions([]);
        setActiveIndex(-1);
        setSearchError(false);
        setHasSearched(false);
        setLoading(false);
        setIsOpen(value.trim().length >= 2);
    }

    function selectCity(city: City) {
        setSelectedCity(city);
        setQuery(formatCityName(city.name));
        setSuggestions([]);
        setActiveIndex(-1);
        setIsOpen(false);
        setSearchError(false);
        setHasSearched(false);
        setLoading(false);
    }

    function clearCity() {
        setSelectedCity(null);
        setQuery('');
        setSuggestions([]);
        setActiveIndex(-1);
        setIsOpen(false);
        setSearchError(false);
        setHasSearched(false);
        setLoading(false);

        inputRef.current?.focus();
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
            return;
        }

        if (!showDropdown) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            if (suggestions.length > 0) {
                setActiveIndex((index) => (index + 1) % suggestions.length);
            }
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();

            if (suggestions.length > 0) {
                setActiveIndex(
                    (index) => (index <= 0 ? suggestions.length : index) - 1,
                );
            }
        }

        if (event.key === 'Enter') {
            // Do not submit an unselected search term.
            event.preventDefault();

            if (activeIndex >= 0 && suggestions[activeIndex]) {
                selectCity(suggestions[activeIndex]);
            }
        }
    }

    return (
        <div className="grid gap-2">
            <Label htmlFor="current-city">
                Current city or municipality (optional)
            </Label>

            <div
                className="relative"
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsOpen(false);
                        setActiveIndex(-1);
                        setLoading(false);

                        if (selectedCity) {
                            setQuery(formatCityName(selectedCity.name));
                        }
                    }
                }}
            >
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />

                    <Input
                        ref={inputRef}
                        id="current-city"
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                        aria-controls={showDropdown ? listboxId : undefined}
                        aria-activedescendant={
                            showDropdown &&
                            activeIndex >= 0 &&
                            suggestions[activeIndex]
                                ? `${listboxId}-option-${activeIndex}`
                                : undefined
                        }
                        aria-invalid={Boolean(error)}
                        autoComplete="off"
                        placeholder="Search for your city"
                        value={query}
                        className="pr-10 pl-10"
                        onChange={(event) =>
                            handleQueryChange(event.target.value)
                        }
                        onFocus={() => {
                            if (
                                trimmedQuery.length >= 2 &&
                                (!selectedCity ||
                                    query !== formatCityName(selectedCity.name))
                            ) {
                                setIsOpen(true);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                    />

                    {loading && (
                        <LoaderCircle
                            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                            aria-hidden="true"
                        />
                    )}
                </div>

                {showDropdown && (
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label="Matching Philippine cities"
                        className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
                    >
                        {loading && (
                            <p className="px-3 py-3 text-sm text-muted-foreground">
                                Searching cities...
                            </p>
                        )}

                        {!loading && searchError && (
                            <p
                                role="alert"
                                className="px-3 py-3 text-sm text-destructive"
                            >
                                Unable to search cities. Please try again.
                            </p>
                        )}

                        {!loading &&
                            !searchError &&
                            hasSearched &&
                            suggestions.length === 0 && (
                                <p className="px-3 py-3 text-sm text-muted-foreground">
                                    No matching Philippine cities found.
                                </p>
                            )}

                        {!loading &&
                            !searchError &&
                            suggestions.map((city, index) => (
                                <button
                                    key={city.code}
                                    id={`${listboxId}-option-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={activeIndex === index}
                                    onMouseDown={(event) => {
                                        // Keep input focus when selecting.
                                        event.preventDefault();
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => selectCity(city)}
                                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
                                        activeIndex === index
                                            ? 'bg-accent text-accent-foreground'
                                            : ''
                                    }`}
                                >
                                    <MapPin
                                        className="mt-0.5 size-5 shrink-0 text-emerald-600"
                                        aria-hidden="true"
                                    />

                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium">
                                            {formatCityName(city.name)}
                                        </span>

                                        <span className="block text-xs text-muted-foreground">
                                            {formatLocation(city)}
                                        </span>
                                    </span>
                                </button>
                            ))}
                    </div>
                )}
            </div>

            <input
                type="hidden"
                name="locality_code"
                value={selectedCity?.code ?? ''}
            />

            {selectedCity && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <MapPin
                        className="size-5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                            {formatCityName(selectedCity.name)}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {formatLocation(selectedCity)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={clearCity}
                        aria-label="Remove selected city"
                        className="rounded-md p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {!selectedCity && trimmedQuery.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Choose a city from the suggestions to save it.
                </p>
            )}

            <div role="status" aria-live="polite" className="sr-only">
                {loading
                    ? 'Searching cities'
                    : showDropdown && hasSearched && !searchError
                      ? `${suggestions.length} city suggestions available`
                      : ''}
            </div>

            <InputError message={error} />

            <p className="text-xs text-muted-foreground">
                Only recognized Philippine cities and municipalities are
                supported. Your selected locality is private by default.
            </p>
        </div>
    );
}
