import {
    HALAL_STATUS_OPTIONS,
    type HalalStatus,
} from '@/types/halalspot/restaurant-filters';

type HalalStatusFilterProps = {
    selected: HalalStatus[];
    onChange: (statuses: HalalStatus[]) => void;
};

export default function HalalStatusFilter({
    selected,
    onChange,
}: HalalStatusFilterProps) {
    function toggleStatus(status: HalalStatus) {
        if (selected.includes(status)) {
            onChange(selected.filter((item) => item !== status));
            return;
        }

        onChange([...selected, status]);
    }

    return (
        <section aria-labelledby="halal-status-heading">
            <h2
                id="halal-status-heading"
                className="mb-3 text-sm font-semibold text-foreground"
            >
                Halal information
            </h2>

            <div className="flex flex-wrap gap-3">
                {HALAL_STATUS_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                        <input
                            type="checkbox"
                            value={option.value}
                            checked={selected.includes(option.value)}
                            onChange={() => toggleStatus(option.value)}
                            className="size-4 accent-brand"
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
        </section>
    );
}
