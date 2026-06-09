import React, { useEffect } from 'react';

/**
 * Props for the Toast component.
 */
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onDismiss: () => void;
}

const typeStyles: Record<NonNullable<ToastProps['type']>, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
};

const typeIcons: Record<NonNullable<ToastProps['type']>, string> = {
  success: '✓', // checkmark
  error: '✗', // cross
  info: 'ℹ', // info
  warning: '⚠', // warning
};

/**
 * A fixed-position toast notification at the bottom-right of the screen.
 * Auto-dismisses after 5 seconds.
 */
const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onDismiss }) => {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  const baseClasses =
    'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out';

  const visibilityClasses = isVisible
    ? 'opacity-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 translate-y-4 pointer-events-none';

  const classes = [baseClasses, typeStyles[type], visibilityClasses]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert" aria-live="polite">
      <span className="text-lg font-bold" aria-hidden="true">
        {typeIcons[type]}
      </span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 rounded-lg p-1 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus:outline-none transition-colors"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-4 w-4"
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
  );
};

export default Toast;
