// cut down version of a reusable DataTable component with loading, error, and empty states
// no pagination controls included
import { Link } from "react-router-dom";

function DataTableV2({
  title,
  headers = [],
  showLinkPath,
  linkPath,
  data = [],
  isLoading,
  isError,
  error,         
  renderRow,
}) {


  return (
    <section className="border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
      <div className="flex flex-row justify-between items-center">
        <h2 className="p-4">
          <span className="text-xl font-semibold">{title}</span>
          
        </h2>
        
        {showLinkPath && (
          <Link to={linkPath} className="btn btn-link no-underline text-primary hover:underline p-4">
            See More ➜
          </Link>
        )}

      </div>

      <div className=" overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
        {/* Table header */}
        <table className="table table-fixed w-full ">
          <thead>
            <tr className="bg-base-200/30">
              {headers.map((header, key) => (
                <th key={key} className="text-center">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Table body */}
        <div className="max-h-50 overflow-y-auto">
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
              ) : isError ? (
                <tr>
                  <td colSpan={headers.length} className="py-10 text-center">
                    <div className="text-red-500 font-semibold">
                      {error?.message || "Something went wrong while loading data."}
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-10 text-center text-gray-400">
                   No records found.
                  </td>
                </tr>
              ) : (
                data.map((item) => renderRow(item))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}


export default DataTableV2;
