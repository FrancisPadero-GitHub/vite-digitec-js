import dayjs from "dayjs";

/**
 * LoanScheduleCardList Component
 *
 * Renders loan schedules as responsive cards with scrollable container and pagination.
 * @param {Array<Object>} data - Array of loan schedule objects.
 * @param {boolean} isLoading - Whether data is being loaded.
 * @param {number} page - Current active page.
 * @param {number} limit - Number of items per page.
 * @param {number} total - Total number of records.
 * @param {function} setPage - Setter function to change the page.
 */
function LoanScheduleCardList({
  data = [],
  isLoading,
  page,
  limit,
  total,
  setPage,
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <section className="border border-base-content/5 bg-base-100 rounded-2xl shadow-md flex flex-col">
      {/* Scrollable card container */}
      <div className="p-4 max-h-[550px] min-h-[550px] overflow-y-auto space-y-4 bg-base-100 rounded-t-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-base-content/60">
            No loan schedules found.
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border border-base-content/10 shadow-sm hover:shadow-lg transition bg-white p-5 flex flex-col gap-3 ${item.paid ? "opacity-80" : ""
                }`}
            >
              {/* Top section */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-base-content/70">
                    Installment #{item.installment_no}
                  </p>
                  <p className="text-lg font-semibold text-base-content">
                    ₱{Number(item.total_due).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${item.paid
                      ? "bg-green-100 text-green-700"
                      : dayjs(item.due_date).isBefore(dayjs(), "day")
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                >
                  {item.paid
                    ? "Paid"
                    : dayjs(item.due_date).isBefore(dayjs(), "day")
                      ? "Overdue"
                      : "Upcoming"}
                </div>
              </div>

              {/* Middle details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-base-content/80">
                <div className="flex flex-col">
                  <span className="text-xs text-base-content/60 ">Due Date</span>
                  <span className="font-semibold">{dayjs(item.due_date).format("MMM D, YYYY")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-base-content/60 ">Status TEMPORARY</span>
                  <span className="font-semibold">{item.status || "Not Provided"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-base-content/60">Principal</span>
                  <span className="font-semibold">₱{Number(item.principal_due).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-base-content/60">Interest</span>
                  <span className="font-semibold">₱{Number(item.interest_due).toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-base-content/60" title="To be implemented">Penalty Fees</span>
                  <span className="font-semibold">₱{Number(item.fee_due).toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-base-content/10">
                <div className="text-xs text-base-content/60">
                  Loan ID: {item.loan_id}
                </div>
                {item.paid && item.paid_at && (
                  <div className="text-xs text-green-600 font-medium">
                    Paid on {dayjs(item.paid_at).format("MMM D, YYYY")}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center p-4 border-t border-base-content/5 bg-base-100 rounded-b-2xl">
        <div className="text-sm text-base-content/70">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} entries
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            «
          </button>
          <button className="join-item btn btn-sm">
            Page {page} of {totalPages || 1}
          </button>
          <button
            className="join-item btn btn-sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            »
          </button>
        </div>
      </div>
    </section>
  );
}

export default LoanScheduleCardList;
