<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EmailVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_verification_notification(): void
    {
        // Arrange: Create the ordinary registration role.
        Role::findOrCreate('user', 'web');

        // Prevent real notifications from being sent.
        Notification::fake();

        // Act: Register through the real Fortify endpoint.
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'verification@example.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect();

        // Assert: The user was created.
        $user = User::query()
            ->where('email', 'verification@example.test')
            ->firstOrFail();

        // The new account must remain unverified.
        $this->assertNull($user->email_verified_at);

        // The ordinary role must still be assigned.
        $this->assertTrue($user->hasRole('user'));

        // Laravel must dispatch a verification notification.
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unverified_user_can_open_verification_notice(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/email/verify')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->component('auth/verify-email')
            );
    }

    public function test_user_can_resend_verification_notification(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->post('/email/verification-notification')
            ->assertRedirect();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_valid_signed_link_verifies_email(): void
    {
        Event::fake([Verified::class]);

        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $this->actingAs($user)->get($url)->assertRedirect();

        $this->assertTrue(
            $user->fresh()->hasVerifiedEmail()
        );

        Event::assertDispatched(Verified::class);
    }

    public function test_tampered_verification_link_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $tamperedUrl = $url.'&unexpected=value';

        $this->actingAs($user)
            ->get($tamperedUrl)
            ->assertForbidden();

        $this->assertFalse(
            $user->fresh()->hasVerifiedEmail()
        );
    }
}
