<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->string('address_line')->nullable();
            $table->string('barangay')->nullable();
            $table->string('city');
            $table->string('province')->nullable();
            $table->string('region')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Philippines');

            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();

            $table->string('status')->default('pending');
            $table->string('verification_status')->default('not_verified');

            $table->jsonb('pending_changes')->nullable();
            $table->boolean('has_pending_changes')->default(false);

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // PostGIS geography column — added via raw SQL since Laravel's
        // schema builder has no native PostGIS column type.
        DB::statement('ALTER TABLE places ADD COLUMN location geography(Point, 4326)');
        DB::statement('CREATE INDEX places_location_spatial_index ON places USING GIST (location)');

        Schema::table('places', function (Blueprint $table) {
            $table->index('slug');
            $table->index('status');
            $table->index('verification_status');
            $table->index('city');
            $table->index('province');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
