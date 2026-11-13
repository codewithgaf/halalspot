import { useState, type FormEvent } from 'react';

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
            className="mt-8 flex flex-col gap-3 sm:flex-row"
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
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />

            <button
                type="submit"
                disabled={!query.trim()}
                className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
                Search
            </button>
        </form>
    );
}
