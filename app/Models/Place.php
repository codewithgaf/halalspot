<?php

namespace App\Models;

use App\Enums\PlaceStatus;
use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\DB;

#[Fillable([
    'name',
    'slug',
    'description',
    'address_line',
    'barangay',
    'city',
    'province',
    'region',
    'postal_code',
    'country',
    'phone',
    'email',
    'website',
    'facebook_url',
    'instagram_url',
    'created_by',
    'updated_by',
])]
class Place extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    /**
     * Which column(s) should receive an auto-generated ULID.
     * We keep the normal auto-incrementing bigint "id" as the actual
     * primary key — "ulid" is a separate, public-facing identifier.
     */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    protected function casts(): array
    {
        return [
            'status' => PlaceStatus::class,
            'verification_status' => VerificationStatus::class,
            'pending_changes' => 'array',
            'has_pending_changes' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Auto-generate a slug from the name if one isn't provided.
     */
    protected static function booted(): void
    {
        static::creating(function (Place $place) {
            if (empty($place->slug)) {
                $place->slug = Str::slug($place->name);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'place_categories');
    }

    /**
     * Public discovery scope — only approved, published places should
     * ever appear to guests/regular users (System_Architecture.md,
     * Architecture_Philosophy #12).
     */
    public function scopePublished($query)
    {
        return $query->where('status', PlaceStatus::Approved)
            ->whereNotNull('published_at');
    }

    /**
     * Get/set the place's location using plain latitude/longitude,
     * translating to/from PostGIS's geography(Point) column under the hood.
     */
    protected function location(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value === null) {
                    return null;
                }

                $point = DB::selectOne(
                    'SELECT ST_X(?::geometry) AS longitude, ST_Y(?::geometry) AS latitude',
                    [$value, $value]
                );

                return [
                    'latitude' => $point->latitude,
                    'longitude' => $point->longitude,
                ];
            },
            set: function ($value) {
                if ($value === null) {
                    return ['location' => null];
                }

                return [
                    'location' => DB::raw(sprintf(
                        "ST_GeogFromText('POINT(%F %F)')",
                        $value['longitude'],
                        $value['latitude']
                    )),
                ];
            },
        );
    }

    /**
 * Filter places within a given radius (in meters) of a point.
 */
    public function scopeNearby($query, float $latitude, float $longitude, float $radiusMeters)
    {
        $point = sprintf('POINT(%F %F)', $longitude, $latitude);

        return $query->whereRaw(
            "ST_DWithin(location, ST_GeogFromText(?), ?)",
            [$point, $radiusMeters]
        );
    }

    /**
     * Same as scopeNearby, but also selects the actual distance (in meters)
     * from the point, and orders results closest-first.
     */
    public function scopeNearbyWithDistance($query, float $latitude, float $longitude, float $radiusMeters)
    {
        $point = sprintf('POINT(%F %F)', $longitude, $latitude);

        return $query
            ->selectRaw(
                '*, ST_Distance(location, ST_GeogFromText(?)) AS distance_meters',
                [$point]
            )
            ->whereRaw('ST_DWithin(location, ST_GeogFromText(?), ?)', [$point, $radiusMeters])
            ->orderBy('distance_meters');
    }

    /**
     * Filter places within a rectangular map viewport, defined by its
     * southwest and northeast corners.
     */
    public function scopeInViewport($query, float $swLat, float $swLng, float $neLat, float $neLng)
    {
        return $query->whereRaw(
            'ST_Within(location::geometry, ST_MakeEnvelope(?, ?, ?, ?, 4326))',
            [$swLng, $swLat, $neLng, $neLat]
        );
    }
}
