import { useEffect, useState } from 'react';

type QrCodeResponse = {
    svg: string;
};

export default function TwoFactorQrCode() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadQrCode() {
            try {
                const response = await fetch('/user/two-factor-qr-code', {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error('QR code request failed');
                }

                const data = (await response.json()) as QrCodeResponse;

                if (typeof data.svg !== 'string') {
                    throw new Error('Invalid QR code response');
                }

                if (!controller.signal.aborted) {
                    setQrCode(data.svg);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError(
                        'Unable to load your QR code. You may need to confirm your password again.',
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadQrCode();

        return () => controller.abort();
    }, []);

    if (loading) {
        return (
            <p role="status" className="text-sm text-muted-foreground">
                Loading authenticator QR code...
            </p>
        );
    }

    if (error || !qrCode) {
        return (
            <p role="alert" className="text-sm text-destructive">
                {error ?? 'Authenticator QR code is unavailable.'}
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app. Do not share it
                with anyone.
            </p>

            <div
                role="img"
                aria-label="Authenticator enrollment QR code"
                className="inline-block max-w-full rounded-xl border bg-white p-4"
            >
                <img
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`}
                    alt="Scan to configure two-factor authentication"
                    className="h-48 w-48"
                />
            </div>
        </div>
    );
}
