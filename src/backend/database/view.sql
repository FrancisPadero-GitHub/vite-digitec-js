-- LOAN ACCOUNTS VIEW VIEW VIEW
-- This version ensures rounding at the calculation level leaving total as the result of the rounded calculations
DROP VIEW IF EXISTS public.loan_accounts_view;
CREATE OR REPLACE VIEW public.loan_accounts_view AS
SELECT
  la.loan_id,
  la.loan_ref_number,
  la.principal,
  la.service_fee,
  la.total_interest,
  la.total_amount_due,

  ROUND(COALESCE(SUM(s.amount_paid), 0), 2) AS total_paid,

  -- total amount due + total fee then minus amount paid
  ROUND(
    COALESCE(la.total_amount_due + SUM(s.fee_due) - SUM(s.amount_paid), 0),
    2
  ) AS outstanding_balance,

  -- interest and principal paid (filtered)
  ROUND(COALESCE(SUM(s.interest_due) FILTER (WHERE s.paid = TRUE), 0), 2) AS interest_paid,
  ROUND(COALESCE(SUM(s.principal_due) FILTER (WHERE s.paid = TRUE), 0), 2) AS principal_paid,

  -- penalty fees
  ROUND(COALESCE(SUM(s.fee_due), 0), 2) AS total_penalty_fees,
  ROUND(COALESCE(SUM(s.fee_due) FILTER (WHERE s.paid = TRUE), 0), 2) AS penalty_fees_paid,

  -- remaining penalty fees (non-negative)
  GREATEST(
    ROUND(COALESCE(SUM(s.fee_due) - SUM(s.fee_due) FILTER (WHERE s.paid = TRUE), 0), 2),
    0
  ) AS remaining_penalty_fees,

  -- remaining principal (non-negative)
  GREATEST(
    ROUND(
      COALESCE(la.principal - SUM(s.principal_due) FILTER (WHERE s.paid = TRUE), la.principal),
      2
    ),
    0
  ) AS remaining_principal,

  -- remaining interest (non-negative)
  GREATEST(
    ROUND(
      COALESCE(la.total_interest - SUM(s.interest_due) FILTER (WHERE s.paid = TRUE), la.total_interest),
      2
    ),
    0
  ) AS remaining_interest,

  la.status,
  la.release_date,
  la.maturity_date,
  la.account_number

FROM loan_accounts la
LEFT JOIN loan_payment_schedules s
  ON la.loan_id = s.loan_id
GROUP BY la.loan_id;
