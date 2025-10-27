import { useState } from "react";
import { Link } from "react-router";
import { useParams } from "react-router";
import dayjs from "dayjs";

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";
import { useFetchPaySched } from "../../backend/hooks/shared/useFetchPaySched";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useMemberRole } from "../../backend/context/useMemberRole";

// components
import LoanScheduleCardList from "./components/LoanScheduleCardList";



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
  const TABLE_PREFIX = "LAPP_";


  const { memberRole } = useMemberRole();

  // console.log(interestRate)


  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            Loan Account Detail
          </h1>
          <div className="flex flex-row items-center gap-3">
            <Link to={`/${memberRole}/coop-loans/loan-accounts`} className="btn btn-neutral whitespace-nowrap">
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
                <p className="text-lg font-semibold">{fullName || "Not Found"}</p>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-base-content/80 border-t pt-4 border-base-content/10">

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Principal</span>
                <span>₱ {Number(accountData.principal || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Interest Rate</span>
                <span>{interestRate} %</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Loan Term</span>
                <span>{loanTerm}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Total Interest</span>
                <span>₱ {Number(accountData.total_interest || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Total Amount Due</span>
                <span>₱ {Number(accountData.total_amount_due || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Total Paid</span>
                <span>₱ {Number(accountData.total_paid || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Outstanding Balance</span>
                <span>₱ {Number(accountData.outstanding_balance || 0).toLocaleString()}</span>
              </div>

              {/* <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Release Date</span>
                <span>
                  {accountData.release_date
                    ? dayjs(accountData.release_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div> */}

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Maturity Date</span>
                <span>
                  {accountData.maturity_date
                    ? dayjs(accountData.maturity_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-base-content/80 border-t pt-4 border-base-content/10">
              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Total Principal Paid</span>
                <span>₱ {Number(accountData.principal_paid || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Remaining Principal</span>
                <span>₱ {Number(accountData.remaining_principal || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Total Interest Paid</span>
                <span>₱ {Number(accountData.interest_paid || 0).toLocaleString()}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Remaining Interest</span>
                <span>₱ {Number(accountData.remaining_interest || 0).toLocaleString()}</span>
              </div>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-base-content/80 border-t pt-4 border-base-content/10">
              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Loan Ref No.</span>
                <span>{accountData.loan_ref_number}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Service Fee</span>
                <span>₱ {Number(accountData.service_fee || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Approved Date</span>
                <span>
                  {accountData.approved_date
                    ? dayjs(accountData.approved_date).format("MMM D, YYYY")
                    : "—"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-base-content/60">Release Date</span>
                <span>
                  {accountData.release_date
                    ? dayjs(accountData.release_date).format("MMM D, YYYY")
                    : "Pending Release"}
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
