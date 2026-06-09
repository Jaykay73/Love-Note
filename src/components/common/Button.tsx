import React from 'react';

/**
 * Props for the Button component.
 */
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-400 border-transparent shadow-sm shadow-rose-200',
  secondary:
    'bg-white text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-400 border-sky-200',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 border-transparent shadow-sm shadow-red-200',
  ghost:
    'bg-transparent text-rose-500 hover:bg-rose-50 focus-visible:ring-rose-400 border-transparent',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={['animate-spin', className].filter(Boolean).join(' ')}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

/**
 * A versatile button component supporting multiple variants, sizes,
 * loading state, and keyboard accessibility.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      type = 'button',
      onClick,
      className = '',
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-xl border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading || undefined}
      >
        {loading && <SpinnerIcon className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
