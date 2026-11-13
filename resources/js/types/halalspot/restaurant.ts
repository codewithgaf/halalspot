import type {
    Cuisine,
    HalalStatus,
} from '@/types/halalspot/restaurant-filters';

export type Restaurant = {
    id: string;
    name: string;
    slug: string;
    cuisine: Cuisine;
    city: string;
    halalStatus: HalalStatus;
    description: string;
    imageUrl: string | null;
};
