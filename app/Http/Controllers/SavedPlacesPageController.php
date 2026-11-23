<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavedPlacesPageController extends Controller
{
    public function index(Request $request): Response
    {
        $savedPlaces = $request->user()
            ->savedPlaces()
            ->where('places.publication_status', 'published')
            ->orderByPivot('created_at', 'desc')
            ->get([
                'places.id',
                'places.name',
                'places.slug',
                'places.city',
            ])
            ->map(fn (Place $place): array => [
                'id' => (string) $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'city' => $place->city,
            ])
            ->values()
            ->all();

        return Inertia::render('account/saved-places', [
            'savedPlaces' => $savedPlaces,
        ]);
    }
}
