import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router";
import dayjs from "dayjs";

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";
import { useFetchPaySched } from "../../backend/hooks/shared/useFetchPaySched";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";

// components
import LoanScheduleCardList from "./components/LoanScheduleCardList";

// icons
import LockIcon from '@mui/icons-material/Lock';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// constants
import { LOAN_ACCOUNT_STATUS_COLORS } from "../../constants/Color";

function LoanAccountDetails() {
  // ID params Grabber 
  const { loan_id } = useParams();

  const parsedId = Number(loan_id);

  // Payment Schedules
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanSchedules, isLoading } = useFetchPaySched({page, limit, loanId: parsedId});
  const loanSchedRaw = loanSchedules?.data || [];
  const total = loanSchedules?.count || 0;

  const { data: loanAcc } = useFetchLoanAcc();
  const loanAccRaw = loanAcc?.data || [];

  const { data: loanAccView } = useFetchLoanAccView();
  const loanAccViewRaw = loanAccView?.data || [];

  // merges the data fetched on the two tables
  const mergedLoanAccounts = loanAccRaw.map(baseRow => {
    const viewRow = loanAccViewRaw.find(v => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow,
      ...viewRow,
    };
  });

  const accountData = mergedLoanAccounts?.find((row) => row.loan_id === parsedId);
  const applicant_id = accountData?.account_number;

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];

  const matchedMember = members?.find(
    (member) => member.account_number === applicant_id
  );

  const fullName = matchedMember
    ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
    : "";

  const { data: loanProducts } = useFetchLoanProducts();

  
  const matchedLoanProduct = loanProducts?.find(
    (product) => product.product_id === accountData?.product_id
  );

  const loanTerm = matchedLoanProduct?.max_term_months;
  const interestRate = matchedLoanProduct?.interest_rate.toLocaleString();
  const amountDisbursed = accountData ? (Number(accountData.principal || 0) - Number(accountData.service_fee || 0)).toLocaleString() : "0";

  const navigate = useNavigate();

  return (
  <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Loan Account Details</h1>
          <div className="flex flex-row items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn btn-neutral whitespace-nowrap">Back</button>
          </div>
        </div>

{/* Loan Account Info Card */}
        {accountData && (
          <div className="space-y-4">
            {/* Account Header */}
            <div className="border border-base-content/10 rounded-2xl bg-base-100 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    accountData.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : accountData.status === "Closed"
                    ? "bg-gray-100 text-gray-600"
                    : accountData.status === "Pending Release"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
                  }`}>
                    {accountData.status === "Active" ? (
                      <DoneAllIcon fontSize="large" color="green" />) : accountData.status === "Closed" ? (
                      <LockIcon fontSize="large" color="gray" />) : (
                      <AccessTimeIcon fontSize="large" color="amber" />) || (
                      "●"
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{accountData.account_number}</p>
                    <p className="text-gray-600 mt-1">{fullName || "Not Found"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`badge badge-soft font-semibold text-base ${
                      LOAN_ACCOUNT_STATUS_COLORS[accountData.status] || "badge-neutral"
                    }`}
                  >
                    {accountData.status || "N/A"}
                  </span>
                  <p className="text-sm text-gray-600 mt-3">{accountData.loan_ref_number}</p>
                </div>
              </div>
            

              {/* TOP ROWW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                
                {/* Loan Overview (how much you asked and how much you get) */}
                <div className="border border-blue-200 rounded-2xl bg-blue-50 p-6">
                  <p className="text-sm text-blue-600 font-semibold mb-2">Loan Overview</p>
                  <p className="text-2xl font-bold text-blue-900 mb-3">
                    ₱{Number(accountData.principal || 0).toLocaleString()}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-blue-700">Principal Amount</span>
                      <span className="font-semibold">₱{Number(accountData.principal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-blue-700">Service Fee</span>
                      <span className="font-semibold text-red-700">-₱{Number(accountData.service_fee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-blue-800 font-medium">Amount Disbursed</span>
                      <span className="font-bold text-blue-900">₱{amountDisbursed}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Progress (how much you paid and how much you owe) */}
                <div className="border border-green-200 rounded-2xl bg-green-50 p-6">
                  <p className="text-sm font-semibold text-green-700 mb-2">Payment Progress</p>
                  <span className="text-2xl font-bold text-green-900">
                    {((Number(accountData.total_paid || 0) / Number(accountData.total_amount_due || 1)) * 100).toFixed(1)}%
                  </span>
                  
                  {/* Progress bar */}
                  <progress 
                    className="progress progress-success w-full h-3 mt-4" 
                    value={Number(accountData.total_paid || 0)} 
                    max={Number(accountData.total_amount_due || 1)}
                  />
                  
                  <div className="flex justify-between text-xs text-green-600 mb-3">
                    <span>Paid</span>
                    <span>Total Repayable</span>
                  </div>

                  <div className="space-y-2 text-sm pt-2 border-t border-green-200 ">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Paid</span>
                      <span className="font-bold text-green-800">₱{Number(accountData.total_paid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Repayable</span>
                      <span className="font-semibold">₱{Number(accountData.total_amount_due || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Outstanding Balance (how much you owe) */}
                <div className="border border-red-200 rounded-2xl bg-red-50 p-6">
                  <p className="text-sm text-red-600 font-semibold mb-2">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-900 mb-3">
                    ₱{Number(accountData.outstanding_balance || 0).toLocaleString()}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-red-200">
                      <span className="text-red-700">Remaining Principal</span>
                      <span className="font-semibold">₱{Number(accountData.remaining_principal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-red-200">
                      <span className="text-red-700">Remaining Interest</span>
                      <span className="font-semibold">₱{Number(accountData.remaining_interest || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-red-800 font-medium">+ Penalties</span>
                      <span className="font-bold text-red-800">₱{Number(accountData.remaining_penalty_fees || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {Number(accountData.remaining_penalty_fees || 0) > 0 && (
                    <div className="mt-3 p-2 bg-red-100 rounded-lg">
                      <p className="text-xs text-red-700">⚠️ Late payment fees</p>
                    </div>
                  )}
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Financial Breakdown (principal + total interest) */}
                <div className="border border-purple-200 rounded-2xl bg-purple-50 p-6">
                  <h3 className="text-sm font-semibold text-purple-800 mb-4 pb-2 border-b border-purple-200 flex items-center gap-2">
                    Financial Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">Principal</span>
                      <span className="font-bold text-purple-900">₱{Number(accountData.principal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">Total Interest ({interestRate}%)</span>
                      <span className="font-bold text-purple-900">₱{Number(accountData.total_interest || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                      <span className="text-sm text-purple-800 font-medium">Total Repayable</span>
                      <span className="font-bold text-purple-900 text-2xl">₱{Number(accountData.total_amount_due || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Important Dates */}
                <div className="border border-gray-200 rounded-2xl bg-white p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                    Important Dates
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Approved</span>
                      <span className="font-semibold text-gray-900">
                        {accountData.approved_date ? dayjs(accountData.approved_date).format("MMM D, YYYY") : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Released</span>
                      <span className="font-semibold text-gray-900">
                        {accountData.release_date ? dayjs(accountData.release_date).format("MMM D, YYYY") : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Loan Term</span>
                      <span className="font-semibold text-gray-900">{loanTerm} Months</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-800 font-medium">Maturity</span>
                      <span className="font-bold text-gray-900">
                        {accountData.maturity_date ? dayjs(accountData.maturity_date).format("MMM D, YYYY") : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Penalty Summary */}
                <div className="border border-amber-200 rounded-2xl bg-orange-50 p-6">
                  <h3 className="text-sm font-semibold text-amber-700 mb-4 pb-2 border-b border-amber-200 flex items-center gap-2">
                    Penalty Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600">Total Penalties</span>
                      <span className="font-semibold">₱{Number(accountData.total_penalty_fees || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-600">Penalties Paid</span>
                      <span className="font-semibold text-amber-700">₱{Number(accountData.penalty_fees_paid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className={`text-sm font-medium ${Number(accountData.remaining_penalty_fees || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Remaining
                      </span>
                      <span className={`font-bold ${Number(accountData.remaining_penalty_fees || 0) === 0 ? 'text-green-600' : 'text-red-900'}`}>
                        ₱{Number(accountData.remaining_penalty_fees || 0).toLocaleString()}
                        {Number(accountData.remaining_penalty_fees || 0) === 0 && Number(accountData.total_penalty_fees || 0) === 0 ? ' ✓' : ''}
                      </span>
                    </div>
                  </div>
                </div>
            </div>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold mt-8 mb-2">Payment Schedules</h3>

        {/* Loan Schedule List */}
        <LoanScheduleCardList
          data={loanSchedRaw}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

export default LoanAccountDetails;
