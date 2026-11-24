import { Form, Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock3, ShieldCheck, ShieldOff } from 'lucide-react';
import { useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorConfirmation from '@/components/security/two-factor-confirmation';
import TwoFactorQrCode from '@/components/security/two-factor-qr-code';
import TwoFactorRecoveryCodes from '@/components/security/two-factor-recovery-codes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
    canManageTwoFactor: boolean;
    twoFactorEnabled?: boolean;
    requiresConfirmation?: boolean;
    twoFactorConfirmed?: boolean;
    twoFactorPending?: boolean;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const enablingRef = useRef(false);

    const [enablingTwoFactor, setEnablingTwoFactor] = useState(false);
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

    const isPending = props.twoFactorPending === true;
    const isConfirmed = props.twoFactorConfirmed === true;
    const isEnabled = props.twoFactorEnabled === true && isConfirmed;

    const [disablingTwoFactor, setDisablingTwoFactor] = useState(false);
    const disablingRef = useRef(false);

    const [cancelingTwoFactor, setCancelingTwoFactor] = useState(false);
    const cancelingRef = useRef(false);

    function enableTwoFactor() {
        if (
            enablingRef.current ||
            !props.canManageTwoFactor ||
            isPending ||
            isEnabled
        ) {
            return;
        }

        enablingRef.current = true;
        setEnablingTwoFactor(true);
        setTwoFactorError(null);

        router.post(
            '/user/two-factor-authentication',
            {},
            {
                preserveScroll: true,
                onError: () => {
                    setTwoFactorError(
                        'Unable to start two-factor authentication. Please try again.',
                    );
                },
                onFinish: () => {
                    enablingRef.current = false;
                    setEnablingTwoFactor(false);
                },
            },
        );
    }

    function cancelPendingTwoFactor() {
        if (!isPending || cancelingRef.current) {
            return;
        }

        const confirmed = window.confirm(
            'Cancel two-factor authentication setup?\n\n' +
                'Your incomplete authenticator setup will be discarded.',
        );

        if (!confirmed) {
            return;
        }

        cancelingRef.current = true;
        setCancelingTwoFactor(true);
        setTwoFactorError(null);

        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,

            onError: () => {
                setTwoFactorError('Unable to cancel setup. Please try again.');
            },

            onFinish: () => {
                cancelingRef.current = false;
                setCancelingTwoFactor(false);
            },
        });
    }

    function disableTwoFactor() {
        if (!isEnabled || disablingRef.current) {
            return;
        }

        const confirmed = window.confirm(
            'Disable two-factor authentication?\n\n' +
                'This will remove your authenticator and invalidate ' +
                'your recovery codes.\n\n' +
                'Administrators and Moderators will lose access to ' +
                'privileged features until MFA is enabled again ' +
                'and a new MFA login challenge is completed.',
        );

        if (!confirmed) {
            return;
        }

        disablingRef.current = true;
        setDisablingTwoFactor(true);
        setTwoFactorError(null);

        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,

            onError: () => {
                setTwoFactorError(
                    'Unable to disable two-factor authentication. ' +
                        'Please confirm your password and try again.',
                );
            },

            onFinish: () => {
                disablingRef.current = false;
                setDisablingTwoFactor(false);
            },
        });
    }

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-8">
                <section aria-label="Password management" className="space-y-6">
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        Current password
                                    </Label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save password'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                {props.canManageTwoFactor && (
                    <section
                        aria-labelledby="two-factor-heading"
                        className="space-y-5 border-t border-border pt-8"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    className="size-5 text-emerald-700 dark:text-emerald-400"
                                    aria-hidden="true"
                                />

                                <h2
                                    id="two-factor-heading"
                                    className="text-lg font-semibold"
                                >
                                    Two-Factor Authentication
                                </h2>
                            </div>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Protect your HalalSpot account with an
                                additional verification step using an
                                authenticator app.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="rounded-xl bg-muted p-3"
                                    aria-hidden="true"
                                >
                                    {isEnabled ? (
                                        <CheckCircle2 className="size-6 text-emerald-700 dark:text-emerald-400" />
                                    ) : isPending ? (
                                        <Clock3 className="size-6 text-amber-700 dark:text-amber-400" />
                                    ) : (
                                        <ShieldOff className="size-6 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <p role="status" className="font-semibold">
                                        {isEnabled
                                            ? 'Two-factor authentication is enabled'
                                            : isPending
                                              ? 'Setup awaiting confirmation'
                                              : 'Two-factor authentication is disabled'}
                                    </p>

                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {isEnabled
                                            ? 'Your account has confirmed two-factor authentication.'
                                            : isPending
                                              ? 'You have started enrollment. An authenticator code is still required to activate protection.'
                                              : 'Enable two-factor authentication to add another layer of account security.'}
                                    </p>
                                </div>
                            </div>

                            {!isEnabled && !isPending && (
                                <div className="mt-6 border-t border-border pt-5">
                                    <Button
                                        type="button"
                                        onClick={enableTwoFactor}
                                        disabled={enablingTwoFactor}
                                        aria-describedby={
                                            twoFactorError
                                                ? 'two-factor-error'
                                                : undefined
                                        }
                                    >
                                        {enablingTwoFactor
                                            ? 'Starting setup...'
                                            : 'Enable Two-Factor Authentication'}
                                    </Button>
                                </div>
                            )}

                            {isPending && (
                                <div className="mt-6 space-y-6 border-t border-border pt-6">
                                    {/* Enrollment progress */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                            Setup in progress
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            MFA is not active yet
                                        </span>
                                    </div>

                                    {/* Step 1 */}
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                            1
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold">
                                                    Scan your authenticator QR
                                                    code
                                                </h3>
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    Open your authenticator app
                                                    and scan the QR code below.
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
                                                <TwoFactorQrCode />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                            2
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold">
                                                    Verify your authenticator
                                                </h3>
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    Enter the six-digit code
                                                    generated by your
                                                    authenticator app to
                                                    complete setup.
                                                </p>
                                            </div>

                                            <TwoFactorConfirmation />
                                        </div>
                                    </div>

                                    {/* Cancel pending setup */}
                                    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Your account will remain without MFA
                                            protection until setup is confirmed.
                                        </p>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full shrink-0 sm:w-auto"
                                            onClick={cancelPendingTwoFactor}
                                            disabled={cancelingTwoFactor}
                                        >
                                            {cancelingTwoFactor
                                                ? 'Canceling...'
                                                : 'Cancel setup'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {twoFactorError && (
                                <p
                                    id="two-factor-error"
                                    role="alert"
                                    className="mt-4 text-sm text-destructive"
                                >
                                    {twoFactorError}
                                </p>
                            )}
                        </div>

                        {isEnabled && (
                            <div className="space-y-5">
                                <TwoFactorRecoveryCodes />

                                <div className="rounded-xl border border-destructive/30 p-5">
                                    <h3 className="font-semibold">
                                        Disable two-factor authentication
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Disabling MFA removes your authenticator
                                        setup and invalidates your recovery
                                        codes. You can enable it again later.
                                    </p>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="mt-4"
                                        onClick={disableTwoFactor}
                                        disabled={disablingTwoFactor}
                                    >
                                        {disablingTwoFactor
                                            ? 'Disabling...'
                                            : 'Disable Two-Factor Authentication'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Administrators and Moderators must complete
                            two-factor authentication before accessing
                            privileged features.
                        </p>
                    </section>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
