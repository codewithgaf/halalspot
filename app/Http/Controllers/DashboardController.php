<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Count only published places saved by this user.
        $savedPlacesCount = $user
            ->savedPlaces()
            ->where('places.publication_status', 'published')
            ->count();

        // Retrieve the three most recently saved
        // published restaurants belonging to this user.
        $recentSavedPlaces = $user
            ->savedPlaces()
            ->where('places.publication_status', 'published')
            ->orderByPivot('created_at', 'desc')
            ->limit(3)
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

        return Inertia::render('dashboard', [
            'savedPlacesCount' => $savedPlacesCount,
            'recentSavedPlaces' => $recentSavedPlaces,
        ]);
    }
}
