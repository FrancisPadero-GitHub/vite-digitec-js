-- New penalty calculator cron job 
-- specified 

CREATE OR REPLACE FUNCTION public.apply_monthly_penalties()
RETURNS void AS $$
DECLARE
    penalty_rate numeric(12,2);
BEGIN
    -- Get penalty rate from settings
    SELECT s.penalty_rate INTO penalty_rate
    FROM public.settings s
    LIMIT 1;

    -- Update schedules that are overdue
    UPDATE public.loan_payment_schedules lps
    SET 
        fee_due = sub.new_fee_due,
        total_due = sub.new_total_due,
        mos_overdue = lps.mos_overdue + sub.new_months,
        status = 'OVERDUE'
    FROM (
        SELECT 
            schedule_id,
            GREATEST(date_part('month', age(current_date, due_date)), 0) - COALESCE(mos_overdue, 0) AS new_months,
            fee_due + (COALESCE(total_due, 0) * (penalty_rate / 100) * 
                (GREATEST(date_part('month', age(current_date, due_date)), 0) - COALESCE(mos_overdue, 0))
            ) AS new_fee_due,
            COALESCE(principal_due, 0) + COALESCE(interest_due, 0) +
                (fee_due + (COALESCE(total_due, 0) * (penalty_rate / 100) *
                (GREATEST(date_part('month', age(current_date, due_date)), 0) - COALESCE(mos_overdue, 0)))) AS new_total_due
        FROM public.loan_payment_schedules
        WHERE paid = FALSE
          AND due_date < current_date
    ) sub
    WHERE lps.schedule_id = sub.schedule_id
      AND sub.new_months > 0;
END;
$$ LANGUAGE plpgsql;