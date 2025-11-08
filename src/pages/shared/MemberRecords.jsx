import { useState, useTransition, useMemo } from "react";
import { useNavigate } from "react-router";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers.js";

// components
import DataTableV2 from "./components/DataTableV2.jsx";
import FilterToolbar from "./components/FilterToolbar.jsx";

// constants
import { ROLE_COLORS, ACCOUNT_STATUS_COLORS } from "../../constants/Color.js";
import placeholderAvatar from "../../assets/placeholder-avatar.png";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce.js";

export default function MemberRecords() {
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
    return usersRaw.filter((row) => {
      const full_name = `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim();
      const matchesSearch = 
        debouncedSearch === "" ||
        (row.full_name && full_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        row.account_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.email.toLowerCase().includes(debouncedSearch.toLowerCase());

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
  const handleClick = (row) => {navigate(`../member-profile/${row.member_id}`);};

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
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
                  { label: "Treasurer", value: "treasurer" },
                  { label: "Board of Director", value: "board" },
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
          title="Member Records"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Account No.", "Member", "Email", "Contact No.", "Role", "Status"]}
          filterActive={activeFiltersText !== "Showing all members"}
          data={users}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.member_id || "Not Found"
            const accountNo = row?.account_number || "Not Found";
            const full_name = `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim() || "Not Provided";
            const avatar = row?.avatar_url || placeholderAvatar;
            const email = row?.email || "Not Provided";
            const contactNo = row?.contact_number || "Not Provided";
            const role = row?.account_role || "Not Provided";
            const status = row?.account_status || "Not Provided";

            return(
              <tr key={id}
                onClick={() => handleClick(row)}
                className="cursor-pointer hover:bg-base-200/70 transition-colors text-center"
              >
                {/* Account Number */}
                <td className="text-center font-medium text-info hover:underline">{accountNo}</td>
                {/* Member Name and Avatar */}
                <td>
                  <span className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10"><img src={avatar} alt={full_name}/></div>
                    </div>
                    {/* Full Name */}
                    <div className="truncate max-w-[120px]">{full_name}</div>
                  </span>
                </td>

                {/* Email */}
                <td className="text-center">{email ? email : "Not Provided"}</td>

                {/* Contact Number */}
                <td className="text-center">{contactNo ? contactNo : "Not Provided"}</td>
                
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
                <td className="text-center">
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
