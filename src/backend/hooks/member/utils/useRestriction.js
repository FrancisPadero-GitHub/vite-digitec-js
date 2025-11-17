// useLoanRestriction.js
import { useFetchProfile } from '../useFetchProfile';
import { useFetchMemberTotal } from '../useFetchMemberTotals';
import { useSettingsCategory } from '../../board/useSettings';
import getYearsMonthsDaysDifference from '../../../../constants/DateCalculation';

export default function useLoanRestriction() {
  const { data: myProfile } = useFetchProfile();
  const { data: shares } = useFetchMemberTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    year: "all",
    month: "all",
  });

  // Fetch loan eligibility settings from the database
  const { data: settings, isLoading: settingsLoading } = useSettingsCategory("loan_eligibility");

  // Extract minimum requirements from settings
  const minTenure = settings?.find(s => s.key === 'tenure')?.value || 1;
  const minAge = settings?.find(s => s.key === 'age')?.value || 18;
  const minShareCapital = settings?.find(s => s.key === 'share_capital')?.value || 5000;

  const joined = myProfile?.joined_date || null;
  const { years: tenure } = getYearsMonthsDaysDifference(joined);

  const birthDay = myProfile?.birthday || null;
  const { years: age } = getYearsMonthsDaysDifference(birthDay);
  const myShares = Number(shares);

  // Compare member's data against the settings from database
  const hasRestriction =
    // minTenure is under a year which is a mismatch
    tenure < Number(minTenure) ||
    age < Number(minAge) ||
    myShares < Number(minShareCapital);

  return { 
    hasRestriction,
    isLoading: settingsLoading,
    requirements: {
      minTenure: Number(minTenure),
      minAge: Number(minAge),
      minShareCapital: Number(minShareCapital),
    },
    currentValues: {
      tenure,
      age,
      shares: myShares,
    }
  };
}
