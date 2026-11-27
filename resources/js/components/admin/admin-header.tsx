import { ShieldCheck } from 'lucide-react';

export function AdminHeader() {
    return (
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md sm:px-8 dark:border-white/10 dark:bg-[#101b18]/95">
            <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    HalalSpot{' '}
                    <span className="font-medium text-slate-400">/ Admin</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Management workspace
                </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Secure workspace</span>
                <span className="sm:hidden">Admin</span>
            </div>
        </header>
    );
}
