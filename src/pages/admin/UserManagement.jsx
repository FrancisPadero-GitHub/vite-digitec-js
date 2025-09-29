import { useState } from "react";
import { useMembers } from "./hooks/useFetchMembers.js";
import MainDataTable from "../treasurer/components/MainDataTable.jsx";
import FilterToolbar from "../shared/components/FilterToolbar.jsx";
import { Link } from "react-router-dom";

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // determines how many rows to render per page

  const { data: members, isLoading, isError, error } = useMembers();

  // Get total count and raw data
  const total = members?.count || 0;
  const usersRaw = members?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const TABLE_PREFIX = "UID"; // unique ID prefix
  const users = usersRaw
  .map((row) => {
    const displayName = `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim();

    return {
      ...row,
      generatedId: `${TABLE_PREFIX}_${row.member_id}`,
      displayName,
      searchKey: `${displayName} ${row.email ?? ""}`.toLowerCase(),
      role: row.account_type,
      status: row.account_status,
    };
  })
  .filter((row) => {
    const matchesSearch =
      searchTerm === "" ||
      row.generatedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.searchKey.includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || row.role === roleFilter;
    const matchesStatus = statusFilter === "" || row.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const openModal = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Users and Role Management</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              to='add-member' // do not put / before or else it would need the parent path for it
            >
              + Create User
            </Link>
          </div>
        </div>

        {/* Dropdown toolbar */}
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Admin", value: "Admin" },
                { label: "Treasurer", value: "Treasurer" },
                { label: "Board of Director", value: "Board" },
                { label: "Regular Member", value: "Regular" },
                { label: "Associate Member", value: "Associate" },
              ],
            },
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "All", value: "" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
                { label: "Revoked", value: "Revoked" },
              ],
            },
          ]}
        />

        {/* Users Table */}
        <MainDataTable
          headers={["ID", "User", "Role", "Status"]}
          data={users}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            return (
              <tr
                key={`${TABLE_PREFIX}${row.member_id}`}
                onClick={() => openModal(row)}
                className="cursor-pointer hover:bg-base-200/70 transition-colors"
              >
                <td className="px-4 py-2 text-center font-medium">{row.generatedId}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={`https://i.pravatar.cc/40?u=${row.generatedId}`}
                          alt={row.displayName}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="font-bold">{row.displayName}</div>
                      <div className="text-sm text-gray-500">{row.email || "No email"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 font-bold">
                  {row.role || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
                <td className="px-5 py-2">
                  {row.status ? (
                    <span
                      className={`badge badge-soft font-semibold ${
                        row.status === "Active"
                          ? "badge-success"
                          : row.status === "Inactive"
                          ? "badge-ghost text-gray-500"
                          : row.status === "Revoked"
                          ? "badge-error"
                          : "badge-soft"
                      }`}
                    >
                      {row.status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>

      {/* This MODAL should render if editModalOpen is true */}
      {editModalOpen && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              User Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.f_name} {selectedMember.m_name} {selectedMember.l_name}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.address || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Birthday</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.birthday
                    ? new Date(selectedMember.birthday).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Employment Status</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.employment_status || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Joined Date</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.joined_date
                    ? new Date(selectedMember.joined_date).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-900">
                  {selectedMember.description || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
