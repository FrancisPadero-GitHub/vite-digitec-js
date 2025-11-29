import { useState, useTransition, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// fetch hooks
import { useMembers } from "../../../backend/hooks/shared/useFetchMembers.js";

// components
import DataTableV2 from '../components/DataTableV2'
import FilterToolbar from "../components/FilterToolbar.jsx";

// constants
import { ROLE_COLORS, ACCOUNT_STATUS_COLORS } from "../../../constants/Color.js";

// utils
import { useDebounce } from "../../../backend/hooks/treasurer/utils/useDebounce.js";

/**
 * 
  Individual member contributions 
  Loan balances and payment history
  Share capital
  Dividends or interest earned - OPTIONALL

 */

export default function MemberStatements() {
  const navigate = useNavigate();
  const { data: members, isLoading, isError, error } = useMembers({});

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /**
   * Use Transitions handler for the filtertable to be smooth and stable if the datasets grow larger
   * it needs to be paired with useMemo on the filtered data (clubFunds)
   * 
   */
  // Add useTransition
  const [isPending, startTransition] = useTransition();

  // Update filter handlers to use startTransition
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  };
  const handleRoleChange = (value) => {
    startTransition(() => {
      setRoleFilter(value);
    });
  };
  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value);
    });
  };

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250)

  const users = useMemo(() => {
    const usersRaw = members?.data || [];
    // Only show regular-member and associate-member roles
    return usersRaw.filter((row) => {
      const allowedRoles = ["regular-member", "associate-member"];
      if (!allowedRoles.includes(row.account_role)) return false;

      const full_name = `${row.f_name ?? ""} ${row.m_name ?? ""} ${row.l_name ?? ""}`.trim();
      const matchesSearch =
        debouncedSearch === "" ||
        full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.account_number.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesRole = roleFilter === "" || row.account_role === roleFilter;
      const matchesStatus = statusFilter === "" || row.account_status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
  }, [members, debouncedSearch, roleFilter, statusFilter]);

  // for data table subtext when filters are active
  const activeFiltersText = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : null,
    roleFilter ? `${roleFilter}"` : null,
    statusFilter ? `${statusFilter}"` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all members";

  // clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
  }

  // Go to a member's profile 
  const handleClick = (row) => { navigate(`../reports/member-statement-details/${row.member_id}`); };

  return (
    <div className="m-3">
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
          {/* Dropdown toolbar */}
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isFilterPending={isPending}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Role",
                value: roleFilter,
                onChange: handleRoleChange,
                options: [
                  { label: "Regular Member", value: "regular-member" },
                  { label: "Associate Member", value: "associate-member" },
                ],
              },
              {
                label: "All Status",
                value: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Revoked", value: "Revoked" },
                ],
              },
            ]}
          />
        </div>

        <DataTableV2
          title="Select Member Statement"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Account No.", "Member", "Role", "Status"]}
          filterActive={activeFiltersText !== "Showing all members"}
          data={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.member_id || "Not Found"
            const accountNo = row?.account_number || "Not Found";
            const full_name = `${row.f_name ?? ""} ${row.m_name ?? ""} ${row.l_name ?? ""}`.trim() || "Not Provided";
            const role = row?.account_role || "Not Provided";
            const status = row?.account_status || "Not Provided";

            return (
              <tr key={id}
                onClick={() => handleClick(row)}
                className="cursor-pointer hover:bg-base-200/70 transition-colors text-center"
              >
                {/* Account Number */}
                <td className="text-center font-medium text-info hover:underline">{accountNo}</td>

                {/* Member Name and Avatar */}
                <td>
                  <div className="flex justify-center">
                    {full_name}
                  </div>
                </td>

                {/* Role */}
                <td>
                  {role ? (
                    <span className={`badge badge-soft font-semibold ${ROLE_COLORS[role]}`}>
                      {role}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Found</span>
                  )}
                </td>

                {/* Status */}
                <td>
                  {status ? (
                    <span className={`badge font-semibold ${ACCOUNT_STATUS_COLORS[status]}`}>
                      {status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
              </tr>
            )
          }}
        />
      </div>
    </div>
  )
}
