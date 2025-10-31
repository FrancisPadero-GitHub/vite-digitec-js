import { useState } from "react";
import { useNavigate } from "react-router";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers.js";

// components
import MainDataTable from "../treasurer/components/MainDataTable.jsx";
import FilterToolbar from "./components/FilterToolbar.jsx";

// constants
import { ROLE_COLORS } from "../../constants/Color.js";
const catGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTVsM3VoOHU1YWpqMjM0ajJ3bTBsODVxbnJsZDIzdTRyajBrazZ0MyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/qZgHBlenHa1zKqy6Zn/giphy.gif"


export default function MemberRecords() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit] = useState(20); // determines how many rows to render per page

  const { data: members, isLoading, isError, error } = useMembers({page, limit});

  

  // Get total count and raw data
  const total = members?.count || 0;
  const usersRaw = members?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const TABLE_PREFIX = "UID"; // unique ID prefix
  const users = usersRaw
  .filter((row) => row.account_role?.toLowerCase() !== "admin") //placed in the meantime to exclude admin
  .map((row) => {
    const displayName = `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim();

    return {
      ...row,
      generatedId: `${TABLE_PREFIX}_${row.member_id}`,
      displayName,
      email: row.email,
      contact_number: row.contact_number,
      role: row.account_role,
      status: row.account_status,
      avatar: row.avatar_url
    };
  })
  .filter((row) => {
    const matchesSearch =
      searchTerm === "" ||
      row.generatedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || row.role === roleFilter;
    const matchesStatus = statusFilter === "" || row.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Go to a member's profile 
  const handleClick = (row) => {
    navigate(`../member-profile/${row.member_id}`);
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Member Records</h1>
        </div>

        {/* Dropdown toolbar */}
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "All Role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { label: "Treasurer", value: "treasurer" },
                { label: "Board of Director", value: "board" },
                { label: "Regular Member", value: "regular-member" },
                { label: "Associate Member", value: "associate-member" },
              ],
            },
            {
              label: "All Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
                { label: "Revoked", value: "Revoked" },
              ],
            },
          ]}
        />

        {/* Users Table */}
        <MainDataTable
          headers={["Account No.", "Member", "Email", "Contact No.", "Role", "Status"]}
          data={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            return (
              <tr
                key={row.account_number}
                onClick={() => handleClick(row)}
                className="cursor-pointer hover:bg-base-200/70 transition-colors"
              >
                <td className="px-4 py-2 text-center font-medium text-info">{row?.account_number || "Something went wrong"}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={row.avatar || catGif ||`https://i.pravatar.cc/40?u=${row.generatedId}` }
                          alt={row.displayName}
                        />
                      </div>
                    </div>

                    <div className="font-semibold">{row.displayName || (<span className="text-gray-400 italic">Not Provided</span>)}</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  {row.email || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.contact_number || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 font-bold text-center">
                  {row.role ? (
                    <span className={`badge badge-soft font-semibold ${ROLE_COLORS[row.role] || "badge-ghost text-gray-400"}`}>
                      {row.role}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
                <td className="px-5 py-2 text-center">
                  {row.status ? (
                    <span
                      className={`badge font-semibold ${
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
    </div>
  )
}
