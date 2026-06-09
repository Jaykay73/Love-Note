import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * An accessible modal dialog rendered via React Portal.
 * - Closes on Escape key press.
 * - Closes on backdrop click.
 * - Traps focus within the modal when open.
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /** Focusable element selector for focus trapping */
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /** Save and restore the previously focused element */
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the dialog on next tick to ensure it's in the DOM
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }

    return () => {
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  /** Handle Escape key press */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    const rootEl = document.getElementById('root');

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden';
      // Hide background content from screen readers
      if (rootEl) {
        rootEl.setAttribute('aria-hidden', 'true');
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore background content for screen readers
      if (rootEl) {
        rootEl.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen, handleKeyDown]);

  /** Close on backdrop click (not on dialog content click) */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100">
          <h2 className="text-lg font-bold text-rose-700">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-400 focus:outline-none transition-colors"
            aria-label="Close dialog"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
