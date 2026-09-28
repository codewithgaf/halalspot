<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';
import 'leaflet/dist/leaflet.css';

interface PlaceMarker {
    ulid: string;
    name: string;
    slug: string;
    city: string;
    verification_status: string;
    location: { latitude: number; longitude: number } | null;
    categories: string[];
}

const props = defineProps<{
    places: PlaceMarker[];
}>();

const mapContainer = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    if (!mapContainer.value) return;

    // Default view centered on Davao region; will auto-fit to actual
    // places below if any exist.
    const L = (await import('leaflet')).default;
    const map = L.map(mapContainer.value).setView([7.1907, 125.4553], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    const markerBounds: L.LatLngExpression[] = [];

    props.places.forEach((place) => {
        if (!place.location) return;

        const coords: L.LatLngExpression = [
            place.location.latitude,
            place.location.longitude,
        ];
        markerBounds.push(coords);

        const marker = L.marker(coords).addTo(map);

        // Build popup content via DOM methods, not raw HTML strings,
        // since place names/cities come from user-submitted content.
        const popup = document.createElement('div');

        const title = document.createElement('strong');
        title.textContent = place.name;
        popup.appendChild(title);

        const cityLine = document.createElement('div');
        cityLine.textContent = place.city;
        popup.appendChild(cityLine);

        const badge = document.createElement('div');
        badge.textContent = place.verification_status;
        badge.style.fontSize = '0.85em';
        badge.style.color = '#16A34A';
        popup.appendChild(badge);

        marker.bindPopup(popup);
    });

    if (markerBounds.length > 0) {
        map.fitBounds(L.latLngBounds(markerBounds), { padding: [40, 40] });
    }
});
</script>

<template>
    <Head title="Explore Halal Places" />

    <div class="flex min-h-screen flex-col bg-brand-light">
        <header class="border-b border-brand-dark/10 bg-white px-6 py-4">
            <h1 class="text-xl font-semibold text-brand-ink">Halalspot</h1>
            <p class="text-sm text-brand-ink/70">Find Halal Places Near You</p>
        </header>

        <main class="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
            <div
                ref="mapContainer"
                class="h-125 w-full rounded-lg lg:h-auto lg:flex-1"
            ></div>

            <aside class="w-full space-y-3 lg:w-80">
                <h2 class="font-medium text-brand-ink">
                    {{ places.length }} place(s) found
                </h2>

                <div
                    v-for="place in places"
                    :key="place.ulid"
                    class="rounded-lg bg-white p-3 shadow-sm"
                >
                    <p class="font-medium text-brand-ink">{{ place.name }}</p>
                    <p class="text-sm text-brand-ink/70">{{ place.city }}</p>
                    <p class="text-xs font-medium text-brand-accent">
                        {{ place.verification_status }}
                    </p>
                </div>
            </aside>
        </main>
    </div>
</template>
