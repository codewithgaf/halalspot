import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminBottomNavigation } from '@/components/admin/admin-bottom-navigation';

type AdminLayoutProps = { children: ReactNode };

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <div className="min-h-screen bg-[#f7f9f7] text-slate-900 dark:bg-[#0c1512] dark:text-slate-100">
            <a
                href="#admin-main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-emerald-900"
            >
                Skip to main content
            </a>
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto bg-[#073b2f] lg:flex">
                <AdminSidebar currentPath={currentPath} />
            </aside>
            <div className="min-w-0 lg:pl-[248px]">
                <AdminHeader />
                <main
                    id="admin-main"
                    className="mx-auto w-full max-w-[1480px] px-4 py-7 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-9 sm:pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-9 xl:px-12"
                >
                    {children}
                </main>
            </div>
            <AdminBottomNavigation currentPath={currentPath} />
        </div>
    );
}
