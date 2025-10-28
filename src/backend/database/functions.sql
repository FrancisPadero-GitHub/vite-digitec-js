-- PENALTY FUNCTION CRON JOB
-- specifically type casted ::numeric for postgres to use the NUMERIC(12, 2) format

CREATE OR REPLACE FUNCTION public.apply_monthly_penalties()
RETURNS void AS $$
DECLARE
    penalty_rate numeric(12,2);
BEGIN
    SELECT s.penalty_rate INTO penalty_rate
    FROM public.settings s
    LIMIT 1;

    UPDATE public.loan_payment_schedules lps
    SET 
        mos_overdue = GREATEST(date_part('month', age(current_date, due_date)), 0)::smallint,

        fee_due = ROUND(sub.new_fee::numeric, 2),

        total_due = ROUND(
            COALESCE(principal_due, 0)::numeric +
            COALESCE(interest_due, 0)::numeric +
            ROUND(sub.new_fee::numeric, 2),
        2),

        status = 'OVERDUE'
    FROM (
        SELECT 
            schedule_id,
            ROUND(
                (
                    COALESCE(fee_due, 0)::numeric +
                    (COALESCE(total_due, 0)::numeric * (penalty_rate / 100)::numeric *
                     GREATEST(date_part('month', age(current_date, due_date)), 0)::numeric)
                ),
            2) AS new_fee
        FROM public.loan_payment_schedules
        WHERE paid = FALSE
          AND due_date < current_date
    ) sub
    WHERE lps.schedule_id = sub.schedule_id;
END;
$$ LANGUAGE plpgsql;
