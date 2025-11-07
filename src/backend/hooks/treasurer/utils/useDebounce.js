import { useState, useEffect } from "react";

/**
 * Debounces a changing value.
 * to reduce the frequency of updates and rerenders.
 * @param {any} value - The value to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup previous timer when value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
