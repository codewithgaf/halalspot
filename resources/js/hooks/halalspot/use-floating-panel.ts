import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Controls a non-modal floating panel.
 *
 * Responsibilities:
 * - Open and close the panel
 * - Handle Escape
 * - Handle outside pointer interactions
 * - Restore focus when dismissed
 * - Focus the close button when opened
 */
export function useFloatingPanel() {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);

    /**
     * Close the panel.
     *
     * Focus is restored unless navigation is starting.
     */
    const closePanel = useCallback((restoreFocus = true) => {
        setIsOpen(false);

        if (restoreFocus) {
            triggerRef.current?.focus();
        }
    }, []);

    /**
     * Toggle visibility using the floating trigger.
     */
    const togglePanel = useCallback(() => {
        setIsOpen((previous) => !previous);
    }, []);

    /**
     * Close with Escape or an outside pointer interaction.
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        closeRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                event.preventDefault();

                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                panelRef.current?.contains(target) ||
                triggerRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
        }

        document.addEventListener('keydown', handleKeyDown);

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);

            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [isOpen]);

    return {
        isOpen,
        togglePanel,
        closePanel,
        triggerRef,
        closeRef,
        panelRef,
    };
}
