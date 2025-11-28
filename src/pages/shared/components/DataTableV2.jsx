// cut down version of a reusable DataTable component with loading, error, and empty states
// no pagination controls included since Im still looking for ways to implement it properly
import { Link } from "react-router-dom";
import React from "react";

function DataTableV2({
  title,
  subtext, // only needed if showLinkPath is false to describe the table content
  type,
  headers = [],
  showLinkPath = false,
  linkPath,
  data = [],
  filterActive = false,
  isLoading,
  isError,
  error,         
  renderRow,
}) {


  return (
    <section className="border border-base-content/5 bg-base-100 rounded-2xl shadow-md">

      {/**
       * Table Title and See More Link if title is provided
       */}
      {title && (
      <div className="flex flex-row justify-between items-center">
        <h2 className="p-3">
          <span className="md:text-2xl lg:text-2xl font-bold">{title}</span>
          {/* <span className={`text-xl font-semibold`}>{title}</span> */}
          {/* Only shows if showLinkPath is true which is associated with dashboard elements */}
          {showLinkPath ? (
            <span className="text-gray-400"> | Recent</span>
          ) : (
            <span className="text-gray-400 text-sm"> | {subtext}</span>
            )}
          </h2>

        {showLinkPath && (
          <Link to={linkPath} className="btn btn-link no-underline text-primary hover:underline p-4">
            See More ➜
          </Link>
        )}

      </div>)}

      <div className="border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md overflow-hidden">
        {/* Scroll wrapper */}
        <div className={`${type === "compact" ? "max-h-[50vh]" : "max-h-[75vh]"} min-h-[17vh] overflow-y-auto overflow-x-auto`}>
          <table className="table w-full min-w-max">
            <thead className="sticky top-0 bg-base-200/80 backdrop-blur-md z-10">
              <tr>
                {headers.map((header, key) => (
                  <th key={key} className="text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={headers.length} className="py-10">
                    <div className="flex flex-col justify-center items-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={headers.length} className="py-10 text-center">
                    <div className="text-red-500 font-semibold">
                      {error?.message || "Something went wrong while fetching data."}
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
                // Render rows based on type if compact it only shows 5 items
                type === "compact" ? data.slice(0, 5).map((item) => renderRow(item)) : data.map((item) => renderRow(item))
              )}

              {filterActive && data.length > 0 && (
              <tr>
                <td colSpan={headers.length} className="text-center">
                  <span className="text-primary font-semibold">End of search</span>
                </td>
              </tr>
              )}

            </tbody>

          </table>
        </div>
      </div>


    </section>
  );
}


export default React.memo(DataTableV2);
