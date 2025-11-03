import { Link } from "react-router-dom";
import React from "react";
/**
 * 
 * @param {*} param0 
 * @returns 
 */
const DataTable = ({ title, linkPath, headers = [], data = [], isLoading, renderRow  }) => {

  return (
    <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
      <div className="flex flex-row justify-between items-center">
        <h2 className="p-4">
          <span className="text-xl font-semibold">{title}</span>
          <span className="text-gray-400"> | Recent</span>
        </h2>
        <Link to={linkPath} className="btn btn-link no-underline text-primary hover:underline p-4">
          See More ➜
        </Link>
      </div>



      <div className="border border-base-content/5 bg-base-100/90 rounded-1xl shadow-md">
          {/* Table header */}
        <table className="table table-fixed w-full">
          <thead>
            <tr className="bg-base-200/30 text-center">
              {headers.map((header, key) => (
                <th key={key} className="text-center">{header}</th>
              ))}
            </tr>
          </thead>
         </table>
          
          
        <div className="max-h-80 overflow-y-auto overflow-x-auto">
          <table className="table table-fixed w-full">
            {/* Scrollable body */}
              <tbody>
                 {isLoading ? (
                <tr>
                  <td colSpan={headers.length} className="py-10">
                    <div className="flex justify-center items-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-10 text-center text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                // instead of pagination we slice it
                data.slice(0,5).map((item) => renderRow(item))
              )}
              </tbody>
            </table>
        </div>
        </div>
    </section>
  );
}

export default React.memo(DataTable);
