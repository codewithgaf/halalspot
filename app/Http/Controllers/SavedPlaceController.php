<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SavedPlaceController extends Controller
{
    /**
     * Return the authenticated user's published saved places.
     */
    public function index(Request $request): JsonResponse
    {
        $places = $request->user()
            ->savedPlaces()
            ->where('places.publication_status', 'published')
            ->orderByPivot('created_at', 'desc')
            ->get([
                'places.id',
                'places.name',
                'places.slug',
                'places.city',
            ]);

        return response()->json([
            'data' => $places->map(fn (Place $place): array => [
                'id' => (string) $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'city' => $place->city,
            ])->values()->all(),
        ]);
    }

    /**
     * Save a published restaurant for the authenticated user.
     */
    public function store(Request $request, Place $place): RedirectResponse
    {
        abort_unless($place->publication_status === 'published', 404);

        DB::table('saved_places')->insertOrIgnore([
            'user_id' => $request->user()->id,
            'place_id' => $place->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }

    /**
     * Remove a restaurant from the authenticated user's saved places.
     */
    public function destroy(Request $request, Place $place): RedirectResponse
    {
        $request->user()
            ->savedPlaces()
            ->detach($place->id);

        return back();
    }
}
