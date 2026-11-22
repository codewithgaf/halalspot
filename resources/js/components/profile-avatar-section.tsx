import { Form } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import ProfileAvatarController from '@/actions/App/Http/Controllers/Settings/ProfileAvatarController';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
    avatarUrl: string | null;
    userName: string;
};

export default function ProfileAvatarSection({ avatarUrl, userName }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const initials =
        userName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('') || '?';

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    }

    function clearSelection() {
        if (inputRef.current) {
            inputRef.current.value = '';
        }

        setPreviewUrl(null);
    }

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <h2 className="font-medium">Profile Photo</h2>

            <div className="flex items-center gap-4">
                <Avatar className="size-20">
                    {(previewUrl || avatarUrl) && (
                        <AvatarImage
                            src={previewUrl ?? avatarUrl ?? undefined}
                            alt="Your profile photo"
                            className="object-cover"
                        />
                    )}
                    <AvatarFallback className="text-lg">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <p className="text-sm text-muted-foreground">
                    Your profile photo is private.
                </p>
            </div>

            <Form
                {...ProfileAvatarController.store.form()}
                options={{ preserveScroll: true }}
                resetOnSuccess
                onSuccess={clearSelection}
                className="space-y-3"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">Choose a photo</Label>
                            <input
                                ref={inputRef}
                                id="avatar"
                                name="avatar"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                aria-describedby="avatar-help"
                                aria-invalid={Boolean(errors.avatar)}
                                onChange={handleFileChange}
                                className="block w-full max-w-md text-sm"
                            />
                            <p
                                id="avatar-help"
                                className="text-xs text-muted-foreground"
                            >
                                JPEG, PNG, or WebP. Maximum 2 MiB.
                            </p>
                            <InputError message={errors.avatar} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                disabled={processing || !previewUrl}
                            >
                                {processing ? 'Uploading...' : 'Save photo'}
                            </Button>

                            {previewUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    onClick={clearSelection}
                                >
                                    Cancel selection
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Form>

            {avatarUrl && (
                <Form
                    {...ProfileAvatarController.destroy.form()}
                    options={{ preserveScroll: true }}
                    onSuccess={clearSelection}
                >
                    {({ processing }) => (
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={processing}
                        >
                            Remove saved photo
                        </Button>
                    )}
                </Form>
            )}
        </section>
    );
}
