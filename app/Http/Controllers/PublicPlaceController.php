<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Inertia\Inertia;
use Inertia\Response;

class PublicPlaceController extends Controller
{
    public function index(): Response
    {
        $places = Place::query()
            ->select([
                'id',
                'name',
                'slug',
                'city',
                'description',
            ])
            ->where('publication_status', 'published')
            ->orderBy('name')
            ->get()
            ->map(fn (Place $place): array => [
                'id' => (string) $place->id,
                'name' => $place->name,
                'slug' => $place->slug,
                'city' => $place->city,
                'description' => $place->description ?? '',
                'imageUrl' => null,
            ])
            ->values()
            ->all();

        return Inertia::render('welcome', [
            'places' => $places,
        ]);
    }
}
