import { useState } from "react";
import { useFetchActivityLogs } from "../../backend/hooks/shared/useFetchActivityLogs";
import FilterToolbar from "./components/FilterToolbar.jsx";

export default function ActivityLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // determines how many rows to render per page

  const { data: logs, isLoading, isError, error } = useFetchActivityLogs(page, limit);
  const logsRaw = logs?.data || [];
  const total = logs?.count || 0;

  // Search state
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [typeFilter, setTypeFilter] = useState("");

  const TABLE_PREFIX = "LOG";

  // Filter activity logs
  const logsData = logsRaw.filter((row) => {
    const member = row.members;
    const fullName = member ? `${member.f_name} ${member.l_name} ${member.account_role}`.toLowerCase(): "";

    const generatedId = `${TABLE_PREFIX}_${row.log_id}`;
    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "" || row.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Activity Logs</h1>
        </div>

        {/* Dropdown toolbar */}
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "All Types",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                {label: "CREATE", value: "CREATE"},
                {label: "UPDATE", value: "UPDATE"},
                {label: "DELETE", value: "DELETE"},
              ]
            }
          ]}
        />

        {/* Activity Logs Table */}
        <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
          <div className="border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            {/* Table header */}
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/30">
                  <th className="text-center w-[7%]">Ref No.</th>
                  <th className="text-center w-[20%]">Date and Time</th>
                  <th className="text-left w-[10%]">Action Taken By</th>
                  <th className="text-center w-[15%]">Type</th>
                  <th className="text-left w-[50%]">Action</th>
                </tr>
              </thead>
            </table>

            {/* Table body */}
            <div className="max-h-50 min-h-[550px] overflow-y-auto overflow-x-auto">
              <table className="table w-full">
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-10">
                        <div className="flex justify-center items-center">
                          <span className="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <div className="text-red-500 font-semibold">
                          {error?.message || "Something went wrong while loading data."}
                        </div>
                      </td>
                    </tr>
                  ) : logsData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500 italic">No data available.</td>
                    </tr>
                  ) : (
                    logsData.map((row) => {
                      const member = row.members;
                      const fullName = member ? `${member.f_name ?? ""} ${member.l_name ?? ""}`.trim(): "Not Found";
                      
                      return (
                        <tr key={`${TABLE_PREFIX}${row.log_id}`} className="cursor-pointer hover:bg-base-200/70 transition-colors">
                          
                          <td className="px-4 py-4 text-center font-medium text-xs w-[7%]">
                            {TABLE_PREFIX}_{row.log_id?.toLocaleString() || "ID"}
                          </td>

                          <td className="px-4 py-2 text-center font-semibold w-[20%]">{new Date(row.timestamp).toLocaleString()}</td>

                          <td className="px-4 py-2 w-[10%]">
                            <div className="flex flex-col items-left">
                              <div className="font-medium">{fullName}</div>
                              <span className="text-gray-600">{member?.account_role}</span>
                            </div>
                          </td>

                          <td className="px-4 py-2 text-center font-semibold w-[15%]">
                            <span className={`badge badge-soft ${
                              row.type === 'CREATE' ? 'badge-success' : 
                              row.type === 'UPDATE' ? 'badge-info' : 
                              'badge-error'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          
                          <td className="px-4 py-2 break-words whitespace-pre-wrap w-[50%]">{row.action}</td>
                        </tr>
                      );
                    })
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
                <button className="join-item btn btn-sm">Page {page} of {totalPages || 1}</button>
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
      </div>
    </div>
  );
}