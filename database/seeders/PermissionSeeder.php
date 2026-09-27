<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'places.view', 'places.create', 'places.update', 'places.delete',
            'places.approve', 'places.reject', 'places.suspend',

            'reviews.create', 'reviews.update', 'reviews.delete', 'reviews.moderate',

            'favorites.create', 'favorites.delete',

            'reports.create', 'reports.view', 'reports.resolve',

            'verification.view', 'verification.create', 'verification.update', 'verification.approve',

            'users.view', 'users.update', 'users.disable',

            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Note: moderators intentionally do NOT get places.update/places.delete.
        // Moderators decide a submission's fate (approve/reject/suspend) but
        // never directly rewrite a user's submitted content — keeps moderation
        // (workflow decisions) cleanly separated from content ownership.
        $moderatorPermissions = [
            'places.view', 'places.create', 'places.approve', 'places.reject', 'places.suspend',
            'reviews.create', 'reviews.moderate',
            'favorites.create', 'favorites.delete',
            'reports.create', 'reports.view', 'reports.resolve',
            'verification.view', 'verification.create', 'verification.update',
            'categories.view',
        ];

        $userPermissions = [
            'places.view', 'places.create',
            'reviews.create',
            'favorites.create', 'favorites.delete',
            'reports.create',
            'categories.view',
        ];

        Role::findByName('admin', 'web')->syncPermissions($permissions);
        Role::findByName('moderator', 'web')->syncPermissions($moderatorPermissions);
        Role::findByName('user', 'web')->syncPermissions($userPermissions);
    }
}
