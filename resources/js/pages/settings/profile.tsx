import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import ContributorPrivacySection from '@/components/contributor-privacy-section';
import DeleteUser from '@/components/delete-user';
import LocalityAutocomplete from '@/components/locality-autocomplete';
import ProfileAvatarSection from '@/components/profile-avatar-section';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';

import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    profile: {
        bio: string | null;
        locality_code: string | null;
        city: {
            code: string;
            name: string;
            region: string;
            province: string | null;
        } | null;
        avatar_url: string | null;
        public_profile_enabled: boolean;
        share_bio: boolean;
        share_city: boolean;
    };
};

export default function Profile() {
    const { auth, profile } = usePage<PageProps>().props;
    const user = auth.user;
    if (!user) {
        return (
            <>
                <Head title="Profile unavailable" />
                <p role="alert" className="p-6 text-sm text-destructive">
                    Your profile is unavailable. Please sign in again.
                </p>
            </>
        );
    }
    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />
                <ProfileAvatarSection
                    avatarUrl={profile.avatar_url}
                    userName={user.name}
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">About me (optional)</Label>

                                <textarea
                                    id="bio"
                                    name="bio"
                                    defaultValue={profile.bio ?? ''}
                                    maxLength={500}
                                    rows={4}
                                    placeholder="Tell us a little about yourself..."
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Maximum 500 characters. Private by default.
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.bio}
                                />
                            </div>

                            <LocalityAutocomplete
                                initialCity={profile.city}
                                error={errors.locality_code}
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
                <ContributorPrivacySection
                    settings={{
                        public_profile_enabled: profile.public_profile_enabled,
                        share_bio: profile.share_bio,
                        share_city: profile.share_city,
                    }}
                />
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
