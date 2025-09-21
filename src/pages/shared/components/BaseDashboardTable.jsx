import { Link } from "react-router-dom";

/**
 * Renders dynamic and reusable table
 *
 * @param {string} title
 * @param {object[]} columns - base column definitions
 * @param {array} data - fetched or empty array fallback
 * @param {string} linkPath - path for the original table
 * @param {number} rowLimit - number of rows to render
 * @param {boolean} isLoading - loading state
 * @param {array} members - optional member data for resolving names
 */

function BaseDashboardTable({
  title,
  columns,
  data = [],
  linkPath,
  rowLimit,
  isLoading,
  members = null,
}) {
  const rows = rowLimit ? data.slice(0, rowLimit) : data;

  // If members are provided, append a "Member" column dynamically
  const finalColumns = members
    ? [
      {
        header: "Member",
        key: "member_name", // unique key
        render: (_, row) => {
          const matchedMember = members.find((m) => m.member_id === row.member_id);
          const isDisabled = !matchedMember; // condition (you can adjust logic)

          return (
            <span
              className={`flex items-center gap-2 ${isDisabled ? "opacity-50" : ""
                }`}
            >
              {matchedMember
                ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                : "System"}

              {isDisabled && (
                <div className="tooltip tooltip-top" data-tip="System Generated">
                  <span className="badge badge-sm badge-ghost">?</span>
                </div>
              )}
            </span>
          );
        },
      },
      ...columns,
    ] : columns;



  return (
    <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
      <div className="flex flex-row justify-between items-center">
        <h2 className="p-4">
          <span className="text-xl font-semibold">{title}</span>
          <span className="text-gray-400"> | Recent</span>
        </h2>
        {linkPath && (
          <Link
            to={linkPath}
            className="btn btn-link no-underline text-primary hover:underline p-4"
          >
            See More ➜
          </Link>
        )}
      </div>

      <div className="border border-base-content/5 bg-base-100/90 rounded-1xl shadow-md">
        {/* Table header */}
        <table className="table table-fixed w-full">
          <thead>
            <tr className="bg-base-200/30 text-left">
              {finalColumns.map(({ header, key }) => (
                <th key={key}>{header}</th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Scrollable body */}
        <div className="max-h-96 overflow-y-auto overflow-x-auto">
          <table className="table table-fixed w-full">
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={finalColumns.length} className="py-10">
                    <div className="flex justify-center items-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.transaction_id || idx}
                    className="cursor-pointer hover:bg-base-200/50"
                  >
                    {finalColumns.map(({ key, render }) => (
                      <td key={key}>
                        {render
                          ? render(row[key], row)
                          : row[key] ?? "Not Provided"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default BaseDashboardTable;
