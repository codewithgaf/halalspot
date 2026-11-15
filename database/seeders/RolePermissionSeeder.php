<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $guard = 'web';

        $permissions = [
            'reviews.create',
            'reviews.update',
            'reviews.moderate',
            'submissions.create',
            'submissions.review',
            'reports.create',
            'reports.moderate',
            'places.create',
            'places.update',
            'places.publish',
            'roles.manage',
            'certifications.verify',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, $guard);
        }

        $userPermissions = [
            'reviews.create',
            'reviews.update',
            'submissions.create',
            'reports.create',
        ];

        $moderatorPermissions = [
            ...$userPermissions,
            'reviews.moderate',
            'submissions.review',
            'reports.moderate',
        ];

        $administratorPermissions = [
            ...$moderatorPermissions,
            'places.create',
            'places.update',
            'places.publish',
            'roles.manage',
        ];

        $rolePermissions = [
            'user' => $userPermissions,
            'moderator' => $moderatorPermissions,
            'administrator' => $administratorPermissions,
        ];

        foreach ($rolePermissions as $roleName => $assignedPermissions) {
            $role = Role::findOrCreate($roleName, $guard);

            $role->syncPermissions($assignedPermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
