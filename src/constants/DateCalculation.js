// Calculte the years months and days since joined
function getYearsMonthsDaysDifference(fromDate, toDate = new Date()) {
  // Ensure both are Date objects
  fromDate = new Date(fromDate);
  toDate = new Date(toDate);

  let years = toDate.getFullYear() - fromDate.getFullYear();
  let months = toDate.getMonth() - fromDate.getMonth();
  let days = toDate.getDate() - fromDate.getDate();

  // Adjust if day is negative (haven't reached the same day this month)
  if (days < 0) {
    months -= 1;

    // Get total days in the previous month
    const previousMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 0);
    days += previousMonth.getDate();
  }

  // Adjust if month is negative (haven’t reached that month yet)
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default getYearsMonthsDaysDifference;
