// USED IN MEMBER PROFILE; WHEN THE TREASURER/BOARD WANTS TO VIEW THE FINANCIAL RECORDS OF A MEMBER
// 3 TABS; CONTAINS SHARE CAPITAL, CLUB FUND, AND LOANS (ONGOING/PAST AND THEIR PAYMENT SCHEDS)

 const FinanceTab = ({
  headers = [],
  data = [],
  label,
  icon,
  renderRow,
  isDefault = false,
  page,
  limit,
  total,
  setPage,
}) => {
   const totalPages = Math.ceil(total / limit);

  return (
    <>
      <label className="tab">
        <input type="radio" name="finances-tab" defaultChecked={isDefault} />{" "}
        {icon} {label}
      </label>

      <div className="tab-content w-full bg-base-100 border-base-300 p-6 space-y-4">
        <h2 className="text-lg font-semibold">{label}</h2>

        {data.length ? (
          <>
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/30">
                  {headers.map((header, key) => (
                    <th key={key} className="text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{data.map((item) => renderRow(item))}</tbody>
            </table>

            {/* Footer pagination */}
            <div className="flex justify-between items-center p-4 border-t border-base-content/5">
              <div className="text-sm text-base-content/70">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
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
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
      </div>
    </>
  );
};

export default FinanceTab;