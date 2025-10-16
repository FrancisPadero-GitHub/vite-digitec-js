import { useState } from "react";
import { Link } from "react-router";
import { useParams } from "react-router";
import dayjs from "dayjs";

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchPaySched } from "../../backend/hooks/shared/useFetchPaySched";
import { useFetchMemberDetails } from "../../backend/hooks/member/useFetchMemberDetails";

// components
import LoanScheduleCardList from "./components/LoanScheduleCardList";



function LoanAccountDetails() {
  // ID params Grabber 
  const { loan_id } = useParams();
  const parsedId = Number(loan_id);

  // Payment Schedules
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanSchedules, isLoading } = useFetchPaySched({page, limit, parsedId});
  const loanSchedRaw = loanSchedules?.data || [];
  const total = loanSchedules?.count || 0;

  // Loan Account Data
  const { data: loanAcc } = useFetchLoanAcc();
  const loanAccRaw = loanAcc?.data || [];

  const accountData = loanAccRaw?.find((row) => row.loan_id === parsedId);
  const applicant_id = accountData?.applicant_id;

  const { data: profileData} = useFetchMemberDetails(applicant_id);
  const fullName = profileData
    ? `${profileData.memberInfo.f_name} ${profileData.memberInfo.m_name} ${profileData.memberInfo.l_name}`.toLowerCase()
    : "";

  // console.log(profileData)

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            Loan Account Detail
          </h1>
          <div className="flex flex-row items-center gap-3">
            <Link to={"/board/loan-accounts"} className="btn btn-neutral whitespace-nowrap">
              Back
            </Link>
          </div>
        </div>

        {/* Loan Account Info Card */}
        {accountData && (
          <div className="border border-base-content/10 rounded-2xl shadow-sm bg-white p-6 space-y-6 hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

              <div>
                <p className="text-sm text-base-content/60">Account Number</p>
                <p className="text-lg font-semibold">{accountData.account_number}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Name</p>
                <p className="text-lg font-semibold">{fullName}</p>
              </div>
              <div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${accountData.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : accountData.status === "Closed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {accountData.status || "N/A"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-base-content/80">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Principal</span>
                <span>₱{Number(accountData.principal || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Outstanding Balance</span>
                <span>₱{Number(accountData.outstanding_balance || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Release Date</span>
                <span>
                  {accountData.release_date
                    ? dayjs(accountData.release_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Maturity Date</span>
                <span>
                  {accountData.maturity_date
                    ? dayjs(accountData.maturity_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-base-content/80 border-t pt-4 border-base-content/10">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Loan ID</span>
                <span>{accountData.loan_id}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Application ID</span>
                <span>{accountData.application_id || "—"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/60">Approved Date</span>
                <span>
                  {accountData.approved_date
                    ? dayjs(accountData.approved_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <h3>Payment Schedules</h3>

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
