import { Link } from "react-router-dom";
/**
 * MainDataTable Component
  *
 * Renders a dynamic table with a header, body, and a built -in pagination footer.
 * @param { string[] } headers - Array of column headers to display at the top of the table.
 * @param { Array < Object >} data - Array of row objects containing the table data for the current page.
 * @param { boolean } isLoading - If true, shows a loading spinner instead of table rows.
 * @param { function} renderRow - Function to render a single row.Receives one row object from`data` as argument and must return a`<tr>` element.
 * @param { number } page - The current active page(1 - indexed).
 * @param { number } limit - Maximum number of rows to display per page.
 * @param { number } total - Total number of records across all pages(used for pagination calculations).
 * @param { function} setPage - Setter function to update the current page.Accepts either a number or a callback`(prevPage) => newPage`.
 * 
 * */

function MainDataTable({
  headers = [],
  data = [],
  isLoading,
  renderRow,
  page,
  limit,
  total,
  setPage,
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
      <div className="border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
        {/* Table header */}
        <table className="table table-fixed w-full">
          <thead>
            <tr className="bg-base-200/30">
              {headers.map((header, key) => (
                  <th
                    key={key}
                    className="text-center" // contains quick fix to center align first column (ref)
                  >
                    {header}
                  </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Table body */}
        <div className="max-h-50 min-h-[550px] overflow-y-auto overflow-x-auto">
          <table className="table table-fixed w-full">
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={headers.length} className="py-10">
                    <div className="flex justify-center items-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => renderRow(item))
              )}
            </tbody>
          </table>
        </div>

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
      </div>
    </section>
  );
}

export default MainDataTable;
