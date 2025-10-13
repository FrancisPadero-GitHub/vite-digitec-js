import dayjs from "dayjs";

function generateSchedule({
  loanId,
  principal,
  interestRate,
  termMonths,
  startDate = dayjs(),
}) {
  if (!loanId || !principal || !interestRate || !termMonths) {
    console.warn("Missing fields for schedule generation:", {
      loanId,
      principal,
      interestRate,
      termMonths,
    });
    return [];
  }

  const schedules = [];
  const monthlyInterestRate = interestRate / 100 / 12; // conver to decimal 6 = 0.006 or 12 = 0.12
  const monthlyPrincipal = principal / termMonths;

  for (let i = 1; i <= termMonths; i++) {
    const interest = principal * monthlyInterestRate;
    const totalDue = monthlyPrincipal + interest;
    const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD"); // fixed

    schedules.push({
      loan_id: loanId,
      installment_no: i,
      due_date: dueDate,
      principal_due: Math.round(monthlyPrincipal),
      interest_due: Math.round(interest),
      total_due: Math.round(totalDue),
      paid: false,
    });
  }

  return schedules;
}

export default generateSchedule;
