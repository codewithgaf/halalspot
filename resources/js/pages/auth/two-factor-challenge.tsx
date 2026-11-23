import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);

    const fieldName = useRecoveryCode ? 'recovery_code' : 'code';

    return (
        <>
            <Head title="Two-factor authentication" />

            <Form
                key={fieldName}
                action="/two-factor-challenge"
                method="post"
                resetOnError={['code', 'recovery_code']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {useRecoveryCode
                                ? 'Enter one of your saved recovery codes to sign in.'
                                : 'Enter the six-digit code from your authenticator app.'}
                        </p>

                        <div className="grid gap-2">
                            <Label htmlFor={fieldName}>
                                {useRecoveryCode
                                    ? 'Recovery code'
                                    : 'Authentication code'}
                            </Label>

                            <Input
                                id={fieldName}
                                name={fieldName}
                                type="text"
                                inputMode={useRecoveryCode ? 'text' : 'numeric'}
                                pattern={
                                    useRecoveryCode ? undefined : '[0-9]{6}'
                                }
                                maxLength={useRecoveryCode ? undefined : 6}
                                autoComplete={
                                    useRecoveryCode ? 'off' : 'one-time-code'
                                }
                                autoCapitalize="none"
                                spellCheck={false}
                                autoFocus
                                required
                                aria-invalid={Boolean(errors[fieldName])}
                                aria-describedby={
                                    errors[fieldName]
                                        ? `${fieldName}-error`
                                        : undefined
                                }
                            />

                            <div id={`${fieldName}-error`}>
                                <InputError message={errors[fieldName]} />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {useRecoveryCode
                                ? 'Verify recovery code'
                                : 'Verify code'}
                        </Button>
                    </>
                )}
            </Form>

            <button
                type="button"
                className="mt-6 w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
            >
                {useRecoveryCode
                    ? 'Use an authenticator code instead'
                    : 'Use a recovery code instead'}
            </button>
        </>
    );
}

TwoFactorChallenge.layout = {
    title: 'Verify your identity',
    description: 'Complete two-factor authentication to securely sign in.',
};
