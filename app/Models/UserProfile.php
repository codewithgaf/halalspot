<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'bio',
    'locality_code',
    'public_profile_enabled',
    'share_bio',
    'share_city',
])]
class UserProfile extends Model
{
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'public_profile_enabled' => 'boolean',
            'share_bio' => 'boolean',
            'share_city' => 'boolean',
        ];
    }
}
