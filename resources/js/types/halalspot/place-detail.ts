export type PlaceDetail = {
    id: string;
    name: string;
    slug: string;
    description: string;
    address: string | null;
    city: string;
    province: string | null;
    countryCode: string | null;
    latitude: string | null;
    longitude: string | null;
    imageUrl: string | null;
};
