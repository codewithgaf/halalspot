<?php

namespace App\Policies;

use App\Enums\PlaceStatus;
use App\Models\Place;
use App\Models\User;

class PlacePolicy
{
    /**
     * Anyone (including guests, handled separately in routes) can browse
     * the places listing. Actual row-level filtering to "published only"
     * happens via Place::published(), not here.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * A published place is visible to everyone. A non-published place
     * (pending/rejected/suspended) is only visible to its owner or staff
     * with places.view.
     */
    public function view(?User $user, Place $place): bool
    {
        if ($place->status === PlaceStatus::Approved && $place->published_at !== null) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $user->id === $place->created_by || $user->can('places.view');
    }

    /**
     * Any authenticated user can submit a new place.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * The owner can update their own place, or staff with places.update.
     */
    public function update(User $user, Place $place): bool
    {
        return $user->id === $place->created_by || $user->can('places.update');
    }

    /**
     * The owner may withdraw their own place only while it's still
     * pending review. Once approved, only staff with places.delete
     * may remove it (it's a public listing at that point).
     */
    public function delete(User $user, Place $place): bool
    {
        if ($user->id === $place->created_by && $place->status === PlaceStatus::Pending) {
            return true;
        }

        return $user->can('places.delete');
    }

    /**
     * Restoring a soft-deleted place is a more sensitive, staff-only action.
     */
    public function restore(User $user, Place $place): bool
    {
        return $user->can('places.update');
    }

    /**
     * Permanently destroying a place bypasses soft-delete recovery
     * entirely — admin only.
     */
    public function forceDelete(User $user, Place $place): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Approve a pending place submission.
     */
    public function approve(User $user, Place $place): bool
    {
        return $user->can('places.approve');
    }

    /**
     * Reject a pending place submission.
     */
    public function reject(User $user, Place $place): bool
    {
        return $user->can('places.reject');
    }

    /**
     * Suspend an already-approved place (e.g. following a valid report).
     */
    public function suspend(User $user, Place $place): bool
    {
        return $user->can('places.suspend');
    }
}
