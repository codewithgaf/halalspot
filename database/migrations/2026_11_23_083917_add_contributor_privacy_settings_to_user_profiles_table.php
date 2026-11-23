<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->boolean('public_profile_enabled')
                ->default(false);

            $table->boolean('share_bio')
                ->default(false);

            $table->boolean('share_city')
                ->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'public_profile_enabled',
                'share_bio',
                'share_city',
            ]);
        });
    }
};
