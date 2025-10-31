import dayjs from "dayjs";

/**
 * LoanScheduleCardList Component
 *
 * Renders loan schedules as responsive cards with scrollable container and pagination.
 */
function LoanScheduleCardList({
  data = [],
  isLoading,
}) {
  return (
    <section className="border border-base-content/5 bg-white rounded-2xl shadow-md flex flex-col">
      <div className="p-4 max-h-[550px] min-h-[550px] overflow-y-auto space-y-3 bg-white rounded-t-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No loan schedules found.</div>
        ) : (
          data.map((item) => {
            const isOverdue = !item.paid && dayjs(item.due_date).isBefore(dayjs(), "day");
            
            return (
              <div
                key={item.schedule_id}
                className={`rounded-xl border transition-all duration-200 ${
                  item.paid 
                    ? "bg-green-50 border-green-200 hover:shadow-md" 
                    : isOverdue 
                    ? "bg-red-50 border-red-200 hover:shadow-lg" 
                    : "bg-white border-gray-200 hover:shadow-lg hover:border-blue-300"
                }`}
              >
                {/* Header (payment due date and status) */}
                <div className="flex justify-between items-center p-4 pb-3 border-b border-base-content/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.paid 
                        ? "bg-green-100 text-green-700" 
                        : isOverdue 
                        ? "bg-red-100 text-red-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      <div className="text-center">
                        <div className="text-xs font-semibold opacity-60">{dayjs(item.due_date).format("MMM")}</div>
                        <div className="text-lg font-bold leading-none">{dayjs(item.due_date).format("DD")}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">
                        <span className="font-medium">Schedule #{item.schedule_id}</span>
                      </p>
                      <p className="font-semibold text-base-content">{dayjs(item.due_date).format("MMM D, YYYY")}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.paid
                        ? "bg-green-200 text-green-800"
                        : isOverdue
                        ? "bg-red-200 text-red-800"
                        : "bg-amber-200 text-amber-800"
                    }`}>
                      {item.paid ? "✓ PAID" : isOverdue ? "⚠ OVERDUE" : "UPCOMING"}
                    </div>
                    {item.paid_at && (
                      <p className="text-xs text-green-600 font-medium">Paid on {dayjs(item.paid_at).format("MMM D, YYYY")}</p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-base-content/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Total Due</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₱{Number(item.total_due).toLocaleString()}
                      </p>
                    </div>
                    {item.amount_paid > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Amount Paid</p>
                        <p className="text-xl font-bold text-green-700">
                          ₱{Number(item.amount_paid).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Breakdowns */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Principal</p>
                    <p className="font-bold">
                      ₱{Number(item.principal_due).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Interest</p>
                    <p className="font-bold text-purple-700">
                      ₱{Number(item.interest_due).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Penalty Fees</p>
                    <p className="font-bold text-red-700">
                      ₱{Number(item.fee_due).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="font-bold text-base-content">
                      {item.status || "Upcoming"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Progress*/}
      <div className="p-4 border-t border-base-content/5 bg-gradient-to-r from-green-50 to-blue-50 rounded-b-2xl space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Repayment Progress</span>
          <span className="text-lg font-bold text-blue-900">
            {data.length > 0 ? Math.round((data.filter(i => i.paid).length / data.length) * 100) : 0}%
          </span>
        </div>
        <progress className="progress progress-success w-full h-3" value={data.filter(i => i.paid).length} max={data.length}></progress>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{data.filter(i => i.paid).length} of {data.length} payments completed</span>
          <span>{data.filter(i => !i.paid).length} remaining</span>
        </div>
      </div>
    </section>
  );
}

export default LoanScheduleCardList;