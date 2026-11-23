import { CircleAlert, CircleCheck } from 'lucide-react';

type EmailVerificationStatusProps = {
    verified: boolean;
};

export default function EmailVerificationStatus({
    verified,
}: EmailVerificationStatusProps) {
    const Icon = verified ? CircleCheck : CircleAlert;

    return (
        <section
            aria-labelledby="email-verification-heading"
            className="rounded-xl border bg-card p-4 sm:p-5"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2
                        id="email-verification-heading"
                        className="text-sm font-semibold"
                    >
                        Email verification
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {verified
                            ? 'Your email address has been confirmed.'
                            : 'You can still explore restaurants and save places.'}
                    </p>
                </div>

                <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        verified
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                >
                    <Icon aria-hidden="true" className="size-4" />

                    {verified ? 'Email verified' : 'Email not verified'}
                </span>
            </div>
        </section>
    );
}
