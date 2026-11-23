import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type PrivacySettings = {
    public_profile_enabled: boolean;
    share_bio: boolean;
    share_city: boolean;
};

type Props = {
    settings: PrivacySettings;
};

export default function ContributorPrivacySection({ settings }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm<PrivacySettings>(settings);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        patch('/settings/profile/privacy', {
            preserveScroll: true,
        });
    }

    function togglePublicProfile(enabled: boolean) {
        setData({
            public_profile_enabled: enabled,
            share_bio: enabled ? data.share_bio : false,
            share_city: enabled ? data.share_city : false,
        });
    }

    return (
        <section
            aria-labelledby="contributor-privacy-title"
            className="space-y-5 rounded-lg border p-4 sm:p-6"
        >
            <div className="space-y-2">
                <h2
                    id="contributor-privacy-title"
                    className="text-lg font-semibold"
                >
                    Contributor privacy
                </h2>

                <p className="text-sm text-muted-foreground">
                    Choose what may be visible when public contributor profiles
                    launch. Your profile is private by default.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Checkbox
                        id="public-profile-enabled"
                        checked={data.public_profile_enabled}
                        disabled={processing}
                        onCheckedChange={(checked) =>
                            togglePublicProfile(checked === true)
                        }
                    />

                    <div className="space-y-1">
                        <Label htmlFor="public-profile-enabled">
                            Enable public contributor profile
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Allow others to view your contributor profile when
                            public profiles launch.
                        </p>
                        <InputError message={errors.public_profile_enabled} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="share-bio"
                            checked={data.share_bio}
                            disabled={
                                !data.public_profile_enabled || processing
                            }
                            onCheckedChange={(checked) =>
                                setData('share_bio', checked === true)
                            }
                        />
                        <div className="space-y-1">
                            <Label htmlFor="share-bio">Share my bio</Label>
                            <p className="text-sm text-muted-foreground">
                                Let visitors read your About Me section.
                            </p>
                            <InputError message={errors.share_bio} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="share-city"
                            checked={data.share_city}
                            disabled={
                                !data.public_profile_enabled || processing
                            }
                            onCheckedChange={(checked) =>
                                setData('share_city', checked === true)
                            }
                        />
                        <div className="space-y-1">
                            <Label htmlFor="share-city">Share my city</Label>
                            <p className="text-sm text-muted-foreground">
                                Let visitors see your selected city.
                            </p>
                            <InputError message={errors.share_city} />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Your email, account security information, and saved places
                    will remain private.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save privacy settings'}
                    </Button>

                    {recentlySuccessful && (
                        <p
                            role="status"
                            className="text-sm text-green-700 dark:text-green-400"
                        >
                            Privacy settings saved.
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
