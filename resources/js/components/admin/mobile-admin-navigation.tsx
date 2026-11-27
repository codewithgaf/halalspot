import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AdminSidebar } from './admin-sidebar';

type MobileAdminNavigationProps = {
    currentPath: string;
    onClose: () => void;
};

export function MobileAdminNavigation({
    currentPath,
    onClose,
}: MobileAdminNavigationProps) {
    const panelRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeButtonRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab' || !panelRef.current) return;

            const focusable = Array.from(
                panelRef.current.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled])',
                ),
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            if (
                event.shiftKey &&
                (active === first || !panelRef.current.contains(active))
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                (active === last || !panelRef.current.contains(active))
            ) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                className="absolute inset-0 bg-slate-950/70"
                aria-label="Close admin navigation"
                onClick={onClose}
                tabIndex={-1}
            />
            <aside
                ref={panelRef}
                id="mobile-admin-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Admin navigation"
                className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-[#052e25] shadow-2xl"
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Close admin navigation"
                    onClick={onClose}
                    className="absolute top-5 right-3 z-10 flex size-9 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                    <X className="size-5" aria-hidden="true" />
                </button>
                <AdminSidebar currentPath={currentPath} onNavigate={onClose} />
            </aside>
        </div>
    );
}
