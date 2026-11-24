import { router } from '@inertiajs/react';
import { Eye, EyeOff, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TwoFactorRecoveryCodes() {
    const [codes, setCodes] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const requestRef = useRef<AbortController | null>(null);
    const regeneratingRef = useRef(false);

    useEffect(() => {
        return () => requestRef.current?.abort();
    }, []);

    function clearDisplayedCodes() {
        requestRef.current?.abort();
        requestRef.current = null;
        setCodes(null);
        setLoading(false);
    }

    function hideCodes() {
        clearDisplayedCodes();
        setError(null);
    }

    async function showCodes() {
        if (requestRef.current || regeneratingRef.current || codes !== null) {
            return;
        }

        const controller = new AbortController();
        requestRef.current = controller;
        setLoading(true);
        setError(null);
        setNotice(null);

        try {
            const response = await fetch('/user/two-factor-recovery-codes', {
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            });

            if (
                !response.ok ||
                !response.headers
                    .get('content-type')
                    ?.includes('application/json')
            ) {
                throw new Error('Recovery codes could not be retrieved');
            }

            const data: unknown = await response.json();

            if (
                !Array.isArray(data) ||
                !data.every((code) => typeof code === 'string')
            ) {
                throw new Error('Unexpected recovery code response');
            }

            if (!controller.signal.aborted) {
                setCodes(data);
            }
        } catch {
            if (!controller.signal.aborted) {
                setError(
                    'Unable to load recovery codes. You may need to confirm your password again.',
                );
            }
        } finally {
            if (requestRef.current === controller) {
                requestRef.current = null;
                setLoading(false);
            }
        }
    }

    function regenerateCodes() {
        if (regeneratingRef.current || requestRef.current) {
            return;
        }

        const confirmed = window.confirm(
            'Regenerate recovery codes?\n\n' +
                'Your previous recovery codes will stop working. ' +
                'You must save the new codes in a secure location.',
        );

        if (!confirmed) return;

        regeneratingRef.current = true;
        setRegenerating(true);
        setError(null);
        setNotice(null);
        clearDisplayedCodes();

        router.post(
            '/user/two-factor-recovery-codes',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotice(
                        'Recovery codes regenerated. Select “Show recovery codes” to view and save the new set.',
                    );
                },
                onError: () => {
                    setError(
                        'Recovery codes could not be regenerated. Confirm your password and try again.',
                    );
                },
                onFinish: () => {
                    regeneratingRef.current = false;
                    setRegenerating(false);
                },
            },
        );
    }

    return (
        <section
            aria-labelledby="recovery-codes-heading"
            className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
        >
            <div className="flex items-start gap-3">
                <div
                    className="rounded-lg bg-emerald-500/10 p-2.5"
                    aria-hidden="true"
                >
                    <KeyRound className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 space-y-1">
                    <h3 id="recovery-codes-heading" className="font-semibold">
                        Recovery codes
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Use a one-time recovery code if you lose access to your
                        authenticator app.
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                <ShieldAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <p>
                    Store these codes in a password manager or another secure
                    place. Never share them.
                </p>
            </div>

            {codes !== null && (
                <div className="space-y-3">
                    {codes.length > 0 ? (
                        <div
                            aria-label="Your recovery codes"
                            className="grid gap-2 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2"
                        >
                            {codes.map((code, index) => (
                                <code
                                    key={index}
                                    className="rounded bg-background px-3 py-2 font-mono text-sm break-all"
                                >
                                    {code}
                                </code>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No recovery codes are currently available.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Hide these codes when you finish saving them.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {codes === null ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={loading || regenerating}
                        onClick={() => void showCodes()}
                    >
                        <Eye className="mr-2 size-4" aria-hidden="true" />
                        {loading ? 'Loading codes...' : 'Show recovery codes'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={hideCodes}
                    >
                        <EyeOff className="mr-2 size-4" aria-hidden="true" />
                        Hide recovery codes
                    </Button>
                )}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={regenerating || loading}
                    onClick={regenerateCodes}
                >
                    <RefreshCw
                        className={`mr-2 size-4 ${regenerating ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                    />
                    {regenerating ? 'Regenerating...' : 'Regenerate codes'}
                </Button>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
                Regenerating invalidates every previous recovery code. You will
                be asked to confirm first.
            </p>

            {notice && (
                <p
                    role="status"
                    className="text-sm text-emerald-700 dark:text-emerald-400"
                >
                    {notice}
                </p>
            )}
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </section>
    );
}
