import React from 'react';

/**
 * Props for the Card component.
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * A white card with rounded corners and a subtle shadow.
 * Use padding variants to control internal spacing.
 */
const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const classes = [
    'bg-white rounded-2xl shadow-md shadow-gray-200/50 border border-gray-100',
    paddingClasses[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

export default Card;
