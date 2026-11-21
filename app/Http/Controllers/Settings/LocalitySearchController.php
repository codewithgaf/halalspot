<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\PhilippineLocalityDirectory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocalitySearchController extends Controller
{
    public function index(
        Request $request,
        PhilippineLocalityDirectory $directory
    ): JsonResponse {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:80'],
        ]);

        return response()->json([
            'data' => $directory->search($validated['q']),
        ]);
    }
}
