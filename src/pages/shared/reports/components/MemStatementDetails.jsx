import { useParams} from 'react-router-dom'

// fetch hooks

import { useFetchMemberDetails } from '../../../../backend/hooks/member/useFetchMemberDetails';

function MemStatementDetails() {
  // const { memberId } = useParams();
  // const parsedId = Number(memberId);

  // const { data, isLoading, isError, error } = useFetchMemberDetails({
  //   memberId: parsedId,
  // });

  // const memberInfo = data?.memberInfo || {};
  // const clubFunds = data?.clubFunds?.data || [];
  // const coopContributions = data?.coopContributions?.data || [];
  // const loanAccount = data?.loanAcc?.data || [];
  
  // const accountNo = memberInfo?.account_number
  // const { data: loanAccView } = useFetchLoanAccView({ accountNumber: accountNo }); // loan acc view to view outstanding balance realtime
  // const loanAccViewRaw = loanAccView?.data || [];

  // const mergedLoanAccounts = loanAccount.map(baseRow => {
  //   const viewRow = loanAccViewRaw.find(v => v.loan_id === baseRow.loan_id);

  //   return {
  //     ...baseRow, // all base table fields
  //     total_paid: viewRow?.total_paid || 0,
  //     outstanding_balance: viewRow?.outstanding_balance || 0,
  //   };
  // });

  return (
    <div>MemStatementDetails</div>
  )
}

export default MemStatementDetails