import { router } from '@inertiajs/react';
import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function TwoFactorConfirmation() {
    const [code, setCode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const submitting = useRef(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting.current || !/^\d{6}$/.test(code)) {
            return;
        }

        submitting.current = true;
        setProcessing(true);
        setError(null);

        router.post(
            '/user/confirmed-two-factor-authentication',
            { code },
            {
                preserveScroll: true,
                errorBag: 'confirmTwoFactorAuthentication',
                onSuccess: () => {
                    setCode('');
                },
                onError: (errors) => {
                    setError(
                        errors.code ??
                            'Unable to confirm the code. Please try again.',
                    );
                },
                onFinish: () => {
                    submitting.current = false;
                    setProcessing(false);
                },
            },
        );
    }

    return (
        <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="two-factor-code">
                    Six-digit authenticator code
                </Label>

                <input
                    id="two-factor-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(event) => {
                        setCode(
                            event.target.value.replace(/\D/g, '').slice(0, 6),
                        );
                        setError(null);
                    }}
                    aria-invalid={error !== null}
                    aria-describedby={
                        error ? 'two-factor-code-error' : undefined
                    }
                    placeholder="000000"
                    className="w-full max-w-xs rounded-lg border border-input bg-background px-4 py-3 text-center text-lg tracking-[0.3em]"
                />

                {error && (
                    <p
                        id="two-factor-code-error"
                        role="alert"
                        className="text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing || code.length !== 6}>
                {processing
                    ? 'Verifying...'
                    : 'Confirm Two-Factor Authentication'}
            </Button>
        </form>
    );
}
