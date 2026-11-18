<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SavedPlaceController extends Controller
{
    /**
     * Save a published restaurant for the authenticated user.
     */
    public function store(
        Request $request,
        Place $place
    ): RedirectResponse {
        // Only published restaurants can be newly saved.
        abort_unless(
            $place->publication_status === 'published',
            404
        );

        // Never trust user_id supplied by the browser.
        $userId = $request->user()->id;

        // insertOrIgnore prevents duplicate saves from
        // producing a database error.
        //
        // The unique constraint on (user_id, place_id)
        // remains the final concurrency protection.
        DB::table('saved_places')->insertOrIgnore([
            'user_id' => $userId,
            'place_id' => $place->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }
}
