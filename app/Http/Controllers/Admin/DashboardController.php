<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalRestaurants' => Place::query()->count(),
                'publishedRestaurants' => Place::query()
                    ->where('publication_status', 'published')
                    ->count(),
                'draftRestaurants' => Place::query()
                    ->where('publication_status', 'draft')
                    ->count(),
                'archivedRestaurants' => Place::query()
                    ->where('publication_status', 'archived')
                    ->count(),
            ],
        ]);
    }
}
