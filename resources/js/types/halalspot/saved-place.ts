export type SavedPlace = {
    id: string;
    name: string;
    slug: string;
    city: string;
};

export type SavedPlacesResponse = {
    data: SavedPlace[];
};
