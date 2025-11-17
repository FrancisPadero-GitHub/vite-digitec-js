import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useShareCapitalLoanable } from '../Calculation';
import * as useSettingsModule from '../../backend/hooks/board/useSettings';

/** Expiremental rani yowts ignore lang ga try pako ani for testing  */

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useShareCapitalLoanable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate loanable amount with 50% percentage', () => {
    // Mock the useSetting hook to return 50%
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '50' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(10000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(5000); // 10000 * 50% = 5000
  });

  it('should calculate loanable amount with 80% percentage', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '80' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(25000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(20000); // 25000 * 80% = 20000
  });

  it('should return 0 when percentage is not available', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(10000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(0); // 10000 * 0% = 0
  });

  it('should handle zero amount', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '50' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(0),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(0);
  });

  it('should handle string amount input', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '50' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable('8000'),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(4000); // 8000 * 50% = 4000
  });

  it('should handle decimal percentages', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '33.33' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(9000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBeCloseTo(2999.7, 1); // 9000 * 33.33% ≈ 2999.7
  });

  it('should handle large amounts', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '75' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(1000000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(750000); // 1000000 * 75% = 750000
  });

  it('should handle 100% percentage', () => {
    vi.spyOn(useSettingsModule, 'useSetting').mockReturnValue({
      data: { value: '100' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(
      () => useShareCapitalLoanable(50000),
      { wrapper: createWrapper() }
    );

    expect(result.current).toBe(50000); // 50000 * 100% = 50000
  });
});
