import { useSetting } from "../backend/hooks/board/useSettings";
import Decimal from "decimal.js";
/**
 * fetches from settings table key: share_capital_percentage
 * to calculate the percentage of the share capital for loanable amount
 * Uses decimal.js for precise calculation
 */

export function useShareCapitalLoanable(amount) {
  const { data: shareCapitalPercentage } = useSetting(
    "loan_eligibility",
    "share_capital_percentage"
  );
  const percentage = shareCapitalPercentage
    ? new Decimal(shareCapitalPercentage)
    : new Decimal(0);
  const totalLoanable = new Decimal(amount || 0).mul(percentage.div(100));
  return {
    totalLoanable: Number(totalLoanable.toFixed(2)),
    percentage: Number(percentage.toFixed(2)),
  };
}
