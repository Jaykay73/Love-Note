import React from 'react';
import Header from './Header';

/**
 * Props for the AppShell component.
 */
export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Top-level layout wrapper providing the app's structural shell:
 * - Header at the top
 * - Centered main content area (flex-1, max-w-3xl)
 * - Subtle footer at the bottom
 */
const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50/30">
      {/* Skip to main content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-rose-400 border-t border-rose-100">
        💌 Love Note &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AppShell;
