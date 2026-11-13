import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

export default function RestaurantSearch() {
    const [query, setQuery] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
            return;
        }

        // Real search functionality will be implemented later.
        console.info('Search requested:', normalizedQuery);
    }

    return (
        <form
            role="search"
            onSubmit={handleSubmit}
            className="relative w-full min-w-0 sm:flex-1"
        >
            <label htmlFor="restaurant-search" className="sr-only">
                Search restaurants, dishes, or cuisines
            </label>

            <input
                id="restaurant-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Restaurant, dish, or cuisine..."
                className="h-14 w-full min-w-0 rounded-2xl border border-border bg-background py-3 pr-16 pl-4 text-base text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:outline-none"
            />

            <button
                type="submit"
                aria-label="Search"
                disabled={!query.trim()}
                className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
                <Search aria-hidden="true" className="size-5" />
            </button>
        </form>
    );
}
