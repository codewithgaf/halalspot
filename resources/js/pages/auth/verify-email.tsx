import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

type VerifyEmailProps = {
    status?: string | null;
};

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    function resendVerification() {
        post('/email/verification-notification', {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Verify your email" />

            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
                <section className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
                    <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                        <MailCheck aria-hidden="true" className="size-7" />
                    </div>

                    <h1 className="text-2xl font-bold">
                        Verify your email address
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        We sent a verification link to your registered email
                        address. Open the email and click the link to activate
                        your account.
                    </p>

                    {status === 'verification-link-sent' && (
                        <p
                            role="status"
                            className="mt-5 rounded-xl bg-brand/10 p-3 text-sm text-brand"
                        >
                            A new verification link has been sent to your email.
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={processing}
                        onClick={resendVerification}
                        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-4 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing
                            ? 'Sending...'
                            : 'Resend verification email'}
                    </button>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Sign out
                    </Link>
                </section>
            </main>
        </>
    );
}
