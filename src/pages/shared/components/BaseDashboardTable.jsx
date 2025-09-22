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
 */

function BaseDashboardTable({
  title,
  columns,
  data = [],
  linkPath,
  rowLimit,
  isLoading,
}) {
  const rows = rowLimit ? data.slice(0, rowLimit) : data;

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
              {columns.map(({ header, key }) => (
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
                  <td colSpan={columns.length} className="py-10">
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
                    {columns.map(({ key, render }) => (
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
