import { useEffect } from 'react';

/**
 * Performance monitoring component for development
 * Logs slow operations to help identify performance bottlenecks
 */
export default function PerformanceMonitor({ children }) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Monitor long tasks
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        }
      });
      
      // Only observe if browser supports it
      if ('PerformanceObserver' in window) {
        observer.observe({ entryTypes: ['longtask'] });
      }

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return children;
}