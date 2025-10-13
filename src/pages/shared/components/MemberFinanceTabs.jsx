// USED IN MEMBER PROFILE; WHEN THE TREASURER/BOARD WANTS TO VIEW THE FINANCIAL RECORDS OF A MEMBER
// 3 TABS; CONTAINS SHARE CAPITAL, CLUB FUND, AND LOANS (ONGOING/PAST AND THEIR PAYMENT SCHEDS)

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import dayjs from "dayjs";

import { useFetchLoanAcc } from "../../board/hooks/useFetchLoanAcc";

export const FinanceTab = ({
  headers = [],
  data = [],
  label,
  icon,
  renderRow,
  isDefault = false, // indicates default tab (which is share capital)
}) => {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // reset to page 1 when tab data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // pagination calculations
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);


  const { memberId } = useParams();
  const parsedId = Number(memberId);

  const { data: loanAcc } = useFetchLoanAcc();
  const loanAccRaw = loanAcc?.data || [];
  const activeLoans = loanAccRaw?.filter(
    (row) => row.applicant_id === parsedId && row.status === "Active"
  );

  // Past (Closed) loans — could be multiple
  const pastLoans = loanAccRaw?.filter(
    (row) => row.applicant_id === parsedId && row.status === "Closed"
  );


  return (
    <>
      <label className="tab">
        <input type="radio" name="finances-tab" defaultChecked={isDefault} /> {icon} {label}
      </label>

      <div className="tab-content w-full bg-base-100 border-base-300 p-6 space-y-4">
        <h2 className="text-lg font-semibold">{label}</h2>

        {data.length ? (
          <>
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/30">
                  {headers.map((header, key) => (
                    <th key={key} className="text-center">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{paginatedData.map((item) => renderRow(item))}</tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4 border-t border-base-content/5">
              <div className="text-sm text-base-content/70">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + paginatedData.length, data.length)} of{" "}
                {data.length} entries
              </div>

              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">
                  Page {currentPage} of {totalPages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            No {label.toLowerCase()} records available.
          </p>
        )}

        {/* EMPTY LOANS TAB PLACEHOLDER */}
        {label === "Loans" && (
          <>
            <h2 className="text-lg font-semibold mb-2 text-primary">Ongoing Loans</h2>
            {activeLoans && activeLoans.length > 0 ? (
              <div className="space-y-4">
                {activeLoans.map((loan) => (
                  <div
                    key={loan.loan_id}
                    className="p-4 border border-base-content/10 rounded-xl shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-base-content/60 uppercase tracking-wide">Account Number</p>
                        <p className="text-base font-semibold">{loan.account_number}</p>
                      </div>

                      <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        {loan.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 text-sm text-base-content/80 border-t border-base-content/10 pt-3">
                      <div>
                        <p className="text-xs text-base-content/60">Principal</p>
                        <p>₱{Number(loan.principal || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Outstanding Balance</p>
                        <p>₱{Number(loan.outstanding_balance || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Release Date</p>
                        <p>
                          {loan.release_date
                            ? dayjs(loan.release_date).format("MMM D, YYYY")
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Maturity Date</p>
                        <p>
                          {loan.maturity_date
                            ? dayjs(loan.maturity_date).format("MMM D, YYYY")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No Ongoing loans.</p>
            )}


            <div className="divider p-4"></div>

            <h2 className="text-lg font-semibold mb-2 text-primary">Past Loans</h2>

            {pastLoans && pastLoans.length > 0 ? (
              <div className="space-y-4">
                {pastLoans.map((loan) => (
                  <div
                    key={loan.loan_id}
                    className="p-4 border border-base-content/10 rounded-xl shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs text-base-content/60 uppercase tracking-wide">Account Number</p>
                        <p className="text-base font-semibold">{loan.account_number}</p>
                      </div>

                      <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        {loan.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 text-sm text-base-content/80 border-t border-base-content/10 pt-3">
                      <div>
                        <p className="text-xs text-base-content/60">Principal</p>
                        <p>₱{Number(loan.principal || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Outstanding Balance</p>
                        <p>₱{Number(loan.outstanding_balance || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Release Date</p>
                        <p>
                          {loan.release_date
                            ? dayjs(loan.release_date).format("MMM D, YYYY")
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Maturity Date</p>
                        <p>
                          {loan.maturity_date
                            ? dayjs(loan.maturity_date).format("MMM D, YYYY")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No past loans.</p>
            )}

          </>
        )}
      </div>
    </>
  );
};

export default FinanceTab;
