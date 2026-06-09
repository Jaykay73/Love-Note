import React from 'react';

/**
 * Props for the Header component.
 */
export interface HeaderProps {
  children?: React.ReactNode;
  title?: string;
}

/**
 * App header displaying the application title on the left
 * and an optional children slot on the right.
 */
const Header: React.FC<HeaderProps> = ({ children, title = 'Love Note' }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-rose-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side: Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="love letter">
            💌
          </span>
          <h1 className="text-xl font-bold text-rose-700">{title}</h1>
        </div>

        {/* Right side: Optional children slot */}
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
};

export default Header;
