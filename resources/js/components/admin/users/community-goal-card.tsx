import { Flag } from 'lucide-react';

const TARGET = 1000;

export function CommunityGoalCard({
    activeAccounts,
}: {
    activeAccounts: number;
}) {
    const achieved = Math.max(0, activeAccounts);
    const progress = Math.min(100, (achieved / TARGET) * 100);
    const remaining = Math.max(0, TARGET - achieved);

    return (
        <section
            aria-labelledby="community-goal"
            className="rounded-2xl bg-linear-to-br from-[#084c3a] to-[#0a7656] p-5 text-white sm:p-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-emerald-100 uppercase">
                        <Flag className="size-4" aria-hidden="true" /> Community
                        milestone
                    </p>
                    <h2
                        id="community-goal"
                        className="mt-2 text-xl font-bold sm:text-2xl"
                    >
                        First 1,000 active accounts
                    </h2>
                    <p className="mt-2 text-xs text-emerald-100/80">
                        Active means registered and not suspended, not monthly
                        usage.
                    </p>
                </div>
                <p className="shrink-0 text-right text-xl font-extrabold tabular-nums">
                    {achieved.toLocaleString()}
                    <span className="block text-xs font-medium text-emerald-100/80">
                        / 1,000
                    </span>
                </p>
            </div>
            <div
                role="progressbar"
                aria-label="Active account goal progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                className="mt-5 h-3 overflow-hidden rounded-full bg-white/20"
            >
                <div
                    className="h-full rounded-full bg-emerald-200"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-2 flex justify-between gap-2 text-xs text-emerald-100">
                <span>{progress.toFixed(1)}% of goal</span>
                <span>
                    {remaining === 0
                        ? 'Milestone achieved!'
                        : `${remaining.toLocaleString()} to go`}
                </span>
            </div>
        </section>
    );
}
