// useLoanRestriction.js
import { useFetchProfile } from '../../../backend/hooks/member/useFetchProfile';
import { useFetchMemberTotal } from '../../../backend/hooks/member/useFetchMemberTotals';
import getYearsMonthsDaysDifference from '../../../constants/DateCalculation';

export function useLoanRestriction() {
  const { data: myProfile } = useFetchProfile();
  const { data: shares } = useFetchMemberTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    year: "all",
    month: "all",
  });

  const joined = myProfile?.joined_date || null;
  const { years: tenure } = getYearsMonthsDaysDifference(joined);
  const birthDay = myProfile?.birthday || null;
  const { years: age } = getYearsMonthsDaysDifference(birthDay);
  const myShares = Number(shares);

  const hasRestriction =
    tenure < 1 ||
    age < 18 ||
    myShares <= 5000;

  return { hasRestriction };
}
