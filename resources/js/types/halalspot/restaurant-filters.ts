export type HalalStatus =
    | 'verified_certification'
    | 'self_declared'
    | 'unknown';

export type Cuisine =
    | 'Filipino'
    | 'Middle Eastern'
    | 'Indian'
    | 'Japanese'
    | 'Korean'
    | 'Turkish'
    | 'Other';

export type RestaurantFilters = {
    cuisines: Cuisine[];
    halalStatuses: HalalStatus[];
};

export const CUISINE_OPTIONS: readonly Cuisine[] = [
    'Filipino',
    'Middle Eastern',
    'Indian',
    'Japanese',
    'Korean',
    'Turkish',
    'Other',
];

export const HALAL_STATUS_OPTIONS: ReadonlyArray<{
    value: HalalStatus;
    label: string;
}> = [
    {
        value: 'verified_certification',
        label: 'Verified certification',
    },
    {
        value: 'self_declared',
        label: 'Self-declared halal',
    },
    {
        value: 'unknown',
        label: 'Unknown status',
    },
];

export const DEFAULT_RESTAURANT_FILTERS: RestaurantFilters = {
    cuisines: [],
    halalStatuses: [],
};
