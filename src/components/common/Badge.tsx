import React from 'react';

/**
 * Props for the Badge component.
 */
export interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  error: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  info: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  default: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
};

/**
 * A small pill-shaped badge for status indicators such as
 * confidence levels (high/medium/low) and validation status.
 */
const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const classes = [
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;
