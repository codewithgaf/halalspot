import {
    CUISINE_OPTIONS,
    type Cuisine,
} from '@/types/halalspot/restaurant-filters';

type CuisineFilterProps = {
    selected: Cuisine[];
    onChange: (cuisines: Cuisine[]) => void;
};

export default function CuisineFilter({
    selected,
    onChange,
}: CuisineFilterProps) {
    function toggleCuisine(cuisine: Cuisine) {
        if (selected.includes(cuisine)) {
            onChange(selected.filter((item) => item !== cuisine));
            return;
        }

        onChange([...selected, cuisine]);
    }

    return (
        <section aria-labelledby="cuisine-filter-heading">
            <h2
                id="cuisine-filter-heading"
                className="mb-3 text-sm font-semibold text-foreground"
            >
                Cuisine
            </h2>

            <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => {
                    const isSelected = selected.includes(cuisine);

                    return (
                        <button
                            key={cuisine}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleCuisine(cuisine)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none ${
                                isSelected
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand/5'
                            }`}
                        >
                            {cuisine}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
