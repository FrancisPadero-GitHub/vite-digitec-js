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
            <div className="border border-base-content/10 rounded-2xl bg-white p-6 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    accountData.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : accountData.status === "Closed"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {accountData.status === "Active" ? (
                      <DoneAllIcon fontSize="large" color="green" />) : accountData.status === "Closed" ? (
                      <LockIcon fontSize="large" color="gray" />) : (
                      "●"
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{accountData.account_number}</p>
                    <p className="text-gray-600 mt-1">{fullName || "Not Found"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    accountData.status === "Active" ? "bg-green-100 text-green-700"
                      : accountData.status === "Closed" ? "bg-gray-200 text-gray-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {accountData.status || "N/A"}
                  </span>
                  <p className="text-sm text-gray-600 mt-3">{accountData.loan_ref_number}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Outstanding balance */}
              <div className="border border-blue-200 rounded-2xl bg-blue-50 p-6">
                <p className="text-sm text-blue-600 font-semibold mb-2">Outstanding Balance</p>
                <p className="text-3xl font-bold text-blue-900">
                  ₱{Number(accountData.outstanding_balance || 0).toLocaleString()}
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between">
                  <span className="text-blue-600">Total Due</span>
                  <span className="font-semibold">₱{Number(accountData.total_amount_due || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Total paid */}
              <div className="border border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 hover:shadow-md transition">
                <p className="text-sm text-green-600 font-semibold mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-green-900">
                  ₱{Number(accountData.total_paid || 0).toLocaleString()}
                </p>
                <div className="mt-3 pt-3 border-t border-green-200 flex justify-between">
                  <span className="text-green-600">Service Fee</span>
                  <span className="font-semibold">₱{Number(accountData.service_fee || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Principal */}
              <div className="border border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 p-6 hover:shadow-md transition">
                <p className="text-sm text-purple-600 font-semibold mb-2">Principal Amount</p>
                <p className="text-3xl font-bold text-purple-900">
                  ₱{Number(accountData.principal || 0).toLocaleString()}
                </p>
                <div className="mt-3 pt-3 border-t border-purple-200 flex justify-between">
                  <span className="text-purple-600">Interest Rate</span>
                  <span className="font-semibold">{interestRate}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Principal Breakdown */}
              <div className="border border-base-content/10 rounded-2xl bg-white p-5">
                <h3 className=" font-semibold text-gray-600 mb-4 pb-2 border-b border-base-content/10">
                  💰 Principal Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Original Amount</span>
                    <span className="font-semibold">₱{Number(accountData.principal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-green-600">Principal Paid</span>
                    <span className="font-semibold text-green-700">₱{Number(accountData.principal_paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-base-content/10">
                    <span className=" text-blue-600 font-medium">Remaining</span>
                    <span className="font-bold text-blue-900">₱{Number(accountData.remaining_principal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Interest Breakdown */}
              <div className="border border-base-content/10 rounded-2xl bg-white p-5">
                <h3 className=" font-semibold text-gray-600 mb-4 pb-2 border-b border-base-content/10">
                  📊 Interest Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Total Interest</span>
                    <span className="font-semibold">₱{Number(accountData.total_interest || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-green-600">Interest Paid</span>
                    <span className="font-semibold text-green-700">₱{Number(accountData.interest_paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-base-content/10">
                    <span className=" text-purple-600 font-medium">Remaining</span>
                    <span className="font-bold text-purple-900">₱{Number(accountData.remaining_interest || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Penalty Breakdown */}
              <div className="border border-base-content/10 rounded-2xl bg-white p-5">
                <h3 className=" font-semibold text-gray-600 mb-4 pb-2 border-b border-base-content/10">
                  ⚠️ Penalty Fees
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Total Penalty</span>
                    <span className="font-semibold">₱{Number(accountData.total_penalty_fees || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-green-600">Penalty Paid</span>
                    <span className="font-semibold text-green-700">₱{Number(accountData.penalty_fees_paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-base-content/10">
                    <span className=" text-red-600 font-medium">Remaining</span>
                    <span className="font-bold text-red-900">₱{Number(accountData.remaining_penalty_fees || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="border border-base-content/10 rounded-2xl bg-white p-5">
                <h3 className=" font-semibold text-gray-600 mb-4 pb-2 border-b border-base-content/10">
                  📅 Important Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Approved</span>
                    <span className="font-semibold">
                      {accountData.approved_date ? dayjs(accountData.approved_date).format("MMM D, YYYY") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Released</span>
                    <span className="font-semibold">
                      {accountData.release_date ? dayjs(accountData.release_date).format("MMM D, YYYY") : "Pending Release"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-600">Loan Term</span>
                    <span className="font-semibold">{loanTerm} Months</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-base-content/10">
                    <span className=" text-gray-600 font-medium">Maturity Date</span>
                    <span className="font-bold text-amber-900">
                      {accountData.maturity_date ? dayjs(accountData.maturity_date).format("MMM D, YYYY") : "—"}
                    </span>
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
