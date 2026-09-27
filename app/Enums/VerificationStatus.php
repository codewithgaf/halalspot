<?php

namespace App\Enums;

enum VerificationStatus: string
{
    case NotVerified = 'not_verified';
    case Pending = 'pending';
    case MuslimFriendly = 'muslim_friendly';
    case VerifiedHalal = 'verified_halal';
    case Expired = 'expired';
    case Rejected = 'rejected';

    /**
     * Internal, precise label (for admin/moderator dashboards).
     */
    public function label(): string
    {
        return match ($this) {
            self::NotVerified => 'Not Verified',
            self::Pending => 'Verification Pending',
            self::MuslimFriendly => 'Muslim Owned / No Pork Food',
            self::VerifiedHalal => 'Verified Halal',
            self::Expired => 'Certification Expired',
            self::Rejected => 'Verification Rejected',
        };
    }

    /**
     * The public-facing label, collapsed to the three approved tiers
     * (Master Instruction section 8). Expired and Rejected must NEVER
     * be shown to the public as if they were still verified.
     */
    public function publicLabel(): string
    {
        return match ($this) {
            self::MuslimFriendly => 'Muslim Owned / No Pork',
            self::VerifiedHalal => 'Verified Halal',
            default => 'Not Verified',
        };
    }
}
