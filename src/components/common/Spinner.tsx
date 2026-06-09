import React from 'react';

/**
 * Props for the Spinner component.
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

/**
 * An animated spinning indicator for loading states.
 * Uses `role="status"` and optional sr-only label for accessibility.
 */
const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label }) => {
  const classes = [
    'animate-spin rounded-full border-gray-300 border-t-blue-600',
    sizeClasses[size],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="inline-flex items-center gap-2" role="status">
      <div className={classes} />
      {label ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};

export default Spinner;
