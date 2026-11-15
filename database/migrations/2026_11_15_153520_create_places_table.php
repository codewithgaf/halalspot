
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();

            // Identity
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Location
            $table->text('address')->nullable();
            $table->string('city', 150);
            $table->string('province', 150)->nullable();
            $table->char('country_code', 2)->default('PH');

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Media
            $table->string('image_path')->nullable();

            // Publication
            $table->string('publication_status', 20)
                ->default('draft');

            $table->timestampTz('published_at')->nullable();

            $table->timestampsTz();

            $table->index([
                'publication_status',
                'city',
            ], 'places_status_city_index');
        });

        // PostgreSQL-specific integrity constraints.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                ALTER TABLE places
                ADD CONSTRAINT places_status_check
                CHECK (
                    publication_status IN (
                        'draft',
                        'published',
                        'archived'
                    )
                )
            ");

            DB::statement('
                ALTER TABLE places
                ADD CONSTRAINT places_latitude_check
                CHECK (
                    latitude IS NULL
                    OR latitude BETWEEN -90 AND 90
                )
            ');

            DB::statement('
                ALTER TABLE places
                ADD CONSTRAINT places_longitude_check
                CHECK (
                    longitude IS NULL
                    OR longitude BETWEEN -180 AND 180
                )
            ');

            DB::statement('
                ALTER TABLE places
                ADD CONSTRAINT places_coordinates_pair_check
                CHECK (
                    (latitude IS NULL AND longitude IS NULL)
                    OR
                    (latitude IS NOT NULL AND longitude IS NOT NULL)
                )
            ');

            DB::statement("
                ALTER TABLE places
                ADD CONSTRAINT places_publication_check
                CHECK (
                    publication_status <> 'published'
                    OR (
                        NULLIF(BTRIM(address), '') IS NOT NULL
                        AND latitude IS NOT NULL
                        AND longitude IS NOT NULL
                        AND published_at IS NOT NULL
                    )
                )
            ");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
