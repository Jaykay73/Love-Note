// =========================================================================
// useDebounce — Generic debounce hook
//
// Returns a debounced copy of the input value that only updates after
// `delay` milliseconds of inactivity.
// =========================================================================

import { useEffect, useState } from 'react';

/**
 * Debounce a value by `delay` milliseconds.
 *
 * The returned value only changes once no new value has been received
 * for at least `delay` ms, making it useful for throttling expensive
 * operations (e.g. live preview rendering) during rapid input.
 *
 * @example
 * ```ts
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
