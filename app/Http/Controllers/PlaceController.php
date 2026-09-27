<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaceController extends Controller
{
    /**
     * Display the public place discovery/map page.
     */
    public function index(Request $request): Response
    {
        $places = Place::published()
            ->with('categories:id,name,slug')
            ->select(['id', 'ulid', 'name', 'slug', 'city', 'verification_status', 'location'])
            ->get()
            ->map(fn (Place $place) => [
                'ulid' => $place->ulid,
                'name' => $place->name,
                'slug' => $place->slug,
                'city' => $place->city,
                'verification_status' => $place->verification_status->publicLabel(),
                'location' => $place->location,
                'categories' => $place->categories->pluck('name'),
            ]);

        return Inertia::render('Explore', [
            'places' => $places,
        ]);
    }
}
