<?php

namespace App\Services\Places;

use App\Models\Place;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class PublishPlace
{
    public function publish(User $actor, Place $place): Place
    {
        Gate::forUser($actor)->authorize('publish', $place);

        return DB::transaction(function () use ($place): Place {
            // Use the latest persisted state.
            $place = Place::query()
                ->whereKey($place->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            // Publishing an already-published place is a no-op.
            if ($place->publication_status === 'published') {
                return $place;
            }

            // Archived places require a separate restoration workflow.
            if ($place->publication_status !== 'draft') {
                throw ValidationException::withMessages([
                    'publication_status' => 'Only draft places can be published.',
                ]);
            }

            // A place must have a usable location.
            if (
                blank($place->address)
                || $place->latitude === null
                || $place->longitude === null
            ) {
                throw ValidationException::withMessages([
                    'place' => 'A place requires an address and coordinates before publication.',
                ]);
            }

            $place->publication_status = 'published';
            $place->published_at = now();
            $place->save();

            return $place->refresh();
        });
    }
}
