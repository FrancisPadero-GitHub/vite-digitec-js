import { describe, it, expect } from 'vitest';
import calcLoanSchedDiminishing from '../calcLoanSchedDiminishing';
import dayjs from 'dayjs';

describe('calcLoanSchedDiminishing', () => {
  it('should calculate diminishing balance loan correctly', () => {
    const result = calcLoanSchedDiminishing({
      interestRate: 12, // 12% annual rate (1% monthly)
      principal: 10000,
      termMonths: 12,
      startDate: dayjs('2024-01-01'),
      generateSchedule: false,
    });

    // Monthly rate = 12% / 12 = 1% = 0.01
    // Formula: Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
    // Payment = 10000 * [0.01(1.01)^12] / [(1.01)^12 - 1]
    // Expected monthly payment around 888.49
    expect(result.monthlyPayment).toBeCloseTo(888.49, 1);
    
    // Total interest should be less than flat rate
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalInterest).toBeLessThan(1200); // Less than flat rate
    
    // Total payable = principal + interest
    expect(result.totalPayable).toBe(result.totalInterest + 10000);
    expect(result.serviceFee).toBe(0);
  });

  it('should handle service fee correctly', () => {
    const result = calcLoanSchedDiminishing({
      interestRate: 12,
      principal: 10000,
      termMonths: 12,
      serviceFeeRate: 5, // 5% service fee
      generateSchedule: false,
    });

    // Service fee = 10000 * 5 / 100 = 500
    expect(result.serviceFee).toBe(500);
    // Net principal = 10000 - 500 = 9500
    // Monthly payment should be calculated on 9500
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeLessThan(888.49); // Less than full principal
  });

  it('should generate schedule when requested', () => {
    const result = calcLoanSchedDiminishing({
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

  it('should have decreasing interest and increasing principal over time', () => {
    const result = calcLoanSchedDiminishing({
      interestRate: 12,
      principal: 10000,
      termMonths: 12,
      startDate: dayjs('2024-01-01'),
      generateSchedule: true,
    });

    // Interest should decrease over time
    expect(result.schedule[0].interest_due).toBeGreaterThan(result.schedule[6].interest_due);
    expect(result.schedule[6].interest_due).toBeGreaterThan(result.schedule[11].interest_due);
    
    // Principal should increase over time
    expect(result.schedule[0].principal_due).toBeLessThan(result.schedule[6].principal_due);
    expect(result.schedule[6].principal_due).toBeLessThan(result.schedule[11].principal_due);
  });

  it('should have consistent monthly payments except the last one', () => {
    const result = calcLoanSchedDiminishing({
      interestRate: 12,
      principal: 10000,
      termMonths: 12,
      startDate: dayjs('2024-01-01'),
      generateSchedule: true,
    });

    // All payments except last should be equal to monthlyPayment
    for (let i = 0; i < 11; i++) {
      expect(result.schedule[i].total_due).toBeCloseTo(result.monthlyPayment, 2);
    }
    
    // Last payment might be slightly different due to rounding
    expect(result.schedule[11].total_due).toBeGreaterThan(0);
  });

  it('should sum to exact principal amount', () => {
    const result = calcLoanSchedDiminishing({
      interestRate: 12,
      principal: 10000,
      termMonths: 12,
      startDate: dayjs('2024-01-01'),
      generateSchedule: true,
    });

    const totalPrincipal = result.schedule.reduce((sum, payment) => sum + payment.principal_due, 0);
    const totalInterest = result.schedule.reduce((sum, payment) => sum + payment.interest_due, 0);
    
    // Total principal should equal original principal
    expect(totalPrincipal).toBeCloseTo(10000, 0);
    
    // Total interest should match result
    expect(totalInterest).toBeCloseTo(result.totalInterest, 0);
  });

  it('should return zero values for invalid inputs', () => {
    const result = calcLoanSchedDiminishing({
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
    const result = calcLoanSchedDiminishing({
      interestRate: 12,
      principal: 1000,
      termMonths: 12,
      serviceFeeRate: 150, // 150% service fee (more than principal)
      generateSchedule: false,
    });

    expect(result.totalInterest).toBe(0);
    expect(result.totalPayable).toBe(0);
  });
});
