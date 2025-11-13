import { describe, it, expect } from 'vitest';
import calcLoanSchedFlat from '../calcLoanSchedFlat';
import dayjs from 'dayjs';

describe('calcLoanSchedFlat', () => {
  it('should calculate flat rate loan correctly', () => {
    const result = calcLoanSchedFlat({
      interestRate: 12, // 12% annual rate
      principal: 10000,
      termMonths: 12,
      startDate: dayjs('2024-01-01'),
      generateSchedule: false,
    });

    // Total interest = principal * rate / 100 = 10000 * 12 / 100 = 1200
    expect(result.totalInterest).toBe(1200);
    // Total payable = principal + interest = 10000 + 1200 = 11200
    expect(result.totalPayable).toBe(11200);
    // Monthly principal = 10000 / 12 = 833.33
    expect(result.monthlyPrincipal).toBe(833.33);
    // Monthly interest = 1200 / 12 = 100
    expect(result.monthlyInterest).toBe(100);
    // Monthly payment = 833.33 + 100 = 933.33
    expect(result.monthlyPayment).toBe(933.33);
    expect(result.serviceFee).toBe(0);
  });

  it('should handle service fee correctly', () => {
    const result = calcLoanSchedFlat({
      interestRate: 10,
      principal: 10000,
      termMonths: 12,
      serviceFeeRate: 5, // 5% service fee
      generateSchedule: false,
    });

    // Service fee = 10000 * 5 / 100 = 500
    expect(result.serviceFee).toBe(500);
    // Net principal = 10000 - 500 = 9500
    // Total interest = 9500 * 10 / 100 = 950
    expect(result.totalInterest).toBe(950);
  });

  it('should generate schedule when requested', () => {
    const result = calcLoanSchedFlat({
      interestRate: 12,
      principal: 10000,
      termMonths: 3,
      startDate: dayjs('2024-01-01'),
      loanId: 'test-loan-1',
      generateSchedule: true,
    });

    expect(result.schedule).toHaveLength(3);
    expect(result.schedule[0]).toHaveProperty('loan_id', 'test-loan-1');
    expect(result.schedule[0]).toHaveProperty('installment_no', 0);
    expect(result.schedule[0]).toHaveProperty('due_date');
    expect(result.schedule[0]).toHaveProperty('principal_due');
    expect(result.schedule[0]).toHaveProperty('interest_due');
    expect(result.schedule[0]).toHaveProperty('total_due');
    expect(result.schedule[0]).toHaveProperty('paid', false);
  });

  it('should handle rounding remainders in last payment', () => {
    const result = calcLoanSchedFlat({
      interestRate: 10,
      principal: 100,
      termMonths: 3,
      startDate: dayjs('2024-01-01'),
      generateSchedule: true,
    });

    // Principal per month = 100 / 3 = 33.33 (rounded)
    // Total interest = 100 * 10 / 100 = 10
    // Interest per month = 10 / 3 = 3.33 (rounded)
    
    // First two payments
    expect(result.schedule[0].principal_due).toBe(33.33);
    expect(result.schedule[0].interest_due).toBe(3.33);
    expect(result.schedule[1].principal_due).toBe(33.33);
    expect(result.schedule[1].interest_due).toBe(3.33);
    
    // Last payment should include remainder
    // Principal remainder: 100 - (33.33 * 3) = 100 - 99.99 = 0.01
    // Interest remainder: 10 - (3.33 * 3) = 10 - 9.99 = 0.01
    expect(result.schedule[2].principal_due).toBe(33.34);
    expect(result.schedule[2].interest_due).toBe(3.34);
  });

  it('should return zero values for invalid inputs', () => {
    const result = calcLoanSchedFlat({
      interestRate: 0,
      principal: 10000,
      termMonths: 12,
      generateSchedule: false,
    });

    expect(result.totalInterest).toBe(0);
    expect(result.totalPayable).toBe(0);
    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
  });

  it('should handle negative net principal due to high service fee', () => {
    const result = calcLoanSchedFlat({
      interestRate: 10,
      principal: 1000,
      termMonths: 12,
      serviceFeeRate: 150, // 150% service fee (more than principal)
      generateSchedule: false,
    });

    expect(result.totalInterest).toBe(0);
    expect(result.totalPayable).toBe(0);
  });
});
