<?php

namespace App\Policies;

use App\Models\Place;
use App\Models\User;

class PlacePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Place $place): bool
    {
        if ($place->publication_status === 'published') {
            return true;
        }

        return $user?->can('places.update') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->can('places.create');
    }

    public function update(User $user, Place $place): bool
    {
        return $user->can('places.update');
    }

    public function publish(User $user, Place $place): bool
    {
        return $user->can('places.publish');
    }

    public function delete(User $user, Place $place): bool
    {
        return false;
    }
}
