import type { Restaurant } from '@/types/halalspot/restaurant';

export const DEMO_RESTAURANTS: Restaurant[] = [
    {
        id: 'demo-restaurant-1',
        name: 'Demo Filipino Kitchen',
        slug: 'demo-filipino-kitchen',
        cuisine: 'Filipino',
        city: 'Sample City',
        halalStatus: 'self_declared',
        description: 'Filipino-inspired dishes in a welcoming setting.',
        imageUrl: null,
    },
    {
        id: 'demo-restaurant-2',
        name: 'Demo Shawarma House',
        slug: 'demo-shawarma-house',
        cuisine: 'Middle Eastern',
        city: 'Sample City',
        halalStatus: 'unknown',
        description: 'Middle Eastern-inspired wraps and rice platters.',
        imageUrl: null,
    },
    {
        id: 'demo-restaurant-3',
        name: 'Demo Indian Table',
        slug: 'demo-indian-table',
        cuisine: 'Indian',
        city: 'Sample City',
        halalStatus: 'unknown',
        description: 'Indian-inspired curries and traditional dishes.',
        imageUrl: null,
    },
];
