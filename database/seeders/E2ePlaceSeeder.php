<?php

namespace Database\Seeders;

use App\Models\Place;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class E2ePlaceSeeder extends Seeder
{
    public function run(): void
    {
        $expectedDatabase = base_path(
            'playwright/.cache/database.sqlite'
        );

        $actualDatabase = DB::connection()->getDatabaseName();

        if (
            ! app()->environment('testing') ||
            DB::getDefaultConnection() !== 'sqlite' ||
            realpath($actualDatabase) !== realpath($expectedDatabase)
        ) {
            throw new RuntimeException(
                'E2E seeding is restricted to the isolated Playwright database.'
            );
        }

        $places = [
            [
                'name' => 'Demo Filipino Kitchen',
                'slug' => 'e2e-filipino-kitchen',
                'city' => 'Iligan City',
                'status' => 'published',
            ],
            [
                'name' => 'Demo Shawarma House',
                'slug' => 'e2e-shawarma-house',
                'city' => 'Marawi City',
                'status' => 'published',
            ],
            [
                'name' => 'Demo Indian Table',
                'slug' => 'e2e-indian-table',
                'city' => 'Davao City',
                'status' => 'published',
            ],
            [
                'name' => 'Draft Restaurant',
                'slug' => 'e2e-draft-restaurant',
                'city' => 'Iligan City',
                'status' => 'draft',
            ],
            [
                'name' => 'Archived Restaurant',
                'slug' => 'e2e-archived-restaurant',
                'city' => 'Iligan City',
                'status' => 'archived',
            ],
        ];

        foreach ($places as $data) {
            $place = Place::firstOrNew([
                'slug' => $data['slug'],
            ]);

            $place->name = $data['name'];
            $place->city = $data['city'];
            $place->description =
                'Fictional restaurant for automated E2E testing.';
            $place->address = 'Sample Street';
            $place->country_code = 'PH';
            $place->latitude = 8.228;
            $place->longitude = 124.245;

            $place->publication_status = $data['status'];

            $place->published_at =
                $data['status'] === 'published'
                ? ($place->published_at ?? now())
                : null;

            $place->save();
        }
    }
}
