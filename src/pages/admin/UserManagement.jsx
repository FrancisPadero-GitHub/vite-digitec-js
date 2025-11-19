import { useState } from "react";
import { Link } from "react-router-dom";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers.js";

// mutation hooks
import { useUpdateMember } from "../../backend/hooks/admin/useEditMember.js";

// components
import MainDataTable from "../treasurer/components/MainDataTable.jsx";
import FilterToolbar from "../shared/components/FilterToolbar.jsx";
import ViewMemberModal from "./modals/ViewMemberModal.jsx";

// constants
import { ROLE_COLORS } from "../../constants/Color.js";
import getYearsMonthsDaysDifference from "../../constants/DateCalculation.js";
import defaultAvatar from '../../assets/placeholder-avatar.png';



// JSX
function UserManagement() {
  const placeHolderAvatar = defaultAvatar;

  // custom states
  const { mutate: updateMemberRole, isPending } = useUpdateMember();

  // fetch all members with pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: members_data, isLoading, isError, error } = useMembers({ page, limit });
  const membersRaw = members_data?.data || [];
  const total = members_data?.count || 0;

  // filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const TABLE_PREFIX = "UID";
  // filters members
  const members = membersRaw
    .map((row) => {
      const displayName = `${row.f_name ?? ""} ${row.l_name ?? ""}`.trim();
      return {
        ...row,
        generatedId: `${TABLE_PREFIX}_${row.member_id}`,
        displayName,
        searchKey: `${displayName} ${row.email ?? ""}`.toLowerCase(),
        role: row.account_role,
        status: row.account_status,
        avatar: row.avatar_url
      };
    })
    .filter((row) => {
      const doNotShowRoles = ["admin"];
      if (doNotShowRoles.includes(row.account_role)) return false;

      const matchesSearch =
        searchTerm === "" ||
        row.generatedId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.searchKey.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "" || row.role === roleFilter;
      const matchesStatus = statusFilter === "" || row.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });


  // modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // state for selected members to populate information
  const [selectedMember, setSelectedMember] = useState(null);

  // stores the new account type for the selected member
  const [newRole, setNewRole] = useState("");
  const [accStatus, setAccStatus] = useState("");

  const openModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.account_role);
    setAccStatus(member.account_status);
    setEditModalOpen(true);
  };

  const save = () => {
    updateMemberRole({
      member_id: selectedMember.member_id,
      account_role: newRole,
      account_status: accStatus,
    });
    setEditModalOpen(false);
  };

  const closeModal = () => {
    setEditModalOpen(false)
    setNewRole("")
    setAccStatus("")
  }

  const memberGroups = [
    {
      title: "Personal Info",
      fields: [
        {
          label: "Full Name",
          value: selectedMember ? `${selectedMember.f_name} ${selectedMember.m_name} ${selectedMember.l_name}` : "N/A",
        },
        { label: "Civil Status", value: selectedMember?.civil_status || "N/A" },
        { label: "Birthday", value: selectedMember?.birthday || "N/A" },
        { label: "Place of Birth", value: selectedMember?.place_of_birth || "N/A" },
        { label: "Contact Number", value: selectedMember?.contact_number || "N/A" },
        { label: "Email", value: selectedMember?.email || "N/A" },
      ],
    },
    {
      title: "Address",
      fields: [
        {
          label: "Complete Address",
          value: [
            selectedMember?.block_no,
            selectedMember?.barangay,
            selectedMember?.city_municipality,
            selectedMember?.province,
            selectedMember?.zip_code,
          ]
            .filter(Boolean)
            .join(", ") || "N/A",
        },
      ],
    },
    {
      title: "Dependents",
      fields: [
        { label: "Spouse Name", value: selectedMember?.spouse_name || "N/A" },
        { label: "Number of Children", value: selectedMember?.number_of_children || "N/A" },
      ],
    },
    {
      title: "Employment",
      fields: [
        { label: "Office Name", value: selectedMember?.office_name || "N/A" },
        { label: "Title & Position", value: selectedMember?.title_and_position || "N/A" },
        { label: "Office Address", value: selectedMember?.office_address || "N/A" },
        { label: "Office Contact Number", value: selectedMember?.office_contact_number || "N/A" },
      ],
    },
    {
      title: "Membership Details",
      fields: [
        { label: "Account Role / Type", value: selectedMember?.account_role || "N/A" },
        { label: "Account Status", value: selectedMember?.account_status || "N/A" },
        { label: "Application Date", value: selectedMember?.application_date || "N/A" },
        { label: "Joined Date", value: selectedMember?.joined_date || "N/A" },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Members and Role Management</h1>
          <div className="flex flex-row items-center gap-3">
            <Link className="btn btn-neutral whitespace-nowrap" to="add-member">
              + Create User
            </Link>
          </div>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { label: "Admin", value: "admin" },
                { label: "Treasurer", value: "treasurer" },
                { label: "Board of Director", value: "board" },
                { label: "Regular Member", value: "regular-member" },
                { label: "Associate Member", value: "associate-member" },
              ],
            },
            {
              label: "Status",
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

        <MainDataTable
          headers={["Account No.", "User", "Role", "Joined date", "Tenure", "Account status"]}
          data={members}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {

            // Calculte the years months and days since joined
            const { years, months, days } = row.joined_date
              ? getYearsMonthsDaysDifference(row.joined_date)
              : { years: 0, months: 0, days: 0 };

            return (
              <tr
                key={`${TABLE_PREFIX}${row.member_id}`}
                onClick={() => openModal(row)}
                className="cursor-pointer hover:bg-base-200/70 transition-colors"
              >
                {/* Account No. */}
                <td className="px-4 py-2 text-center text-info font-medium">
                  {row.account_number}
                </td>

                {/* Name and avatar */}
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="avatar shrink-0">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={row.avatar || placeHolderAvatar}
                          alt={row.displayName}
                        />
                      </div>
                    </div>

                    <div className="text-left min-w-0">
                      {/* Display name with tooltip */}
                      <div className="font-bold truncate max-w-[150px]" title={row.displayName}>
                        {row.displayName}
                      </div>

                      {/* Email with tooltip */}
                      <div className="text-sm text-gray-500 truncate max-w-[150px]" title={row.email || "No email"}>
                        {row.email || "No email"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Account Role */}
                <td className="px-4 py-2 text-center font-bold">
                  {row.role ? (
                    <span
                      className={`badge badge-soft font-semibold ${ROLE_COLORS[row.role] || "badge-ghost text-gray-400"}`}
                    >
                      {row.role}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>

                {/* To sort out later on */}
                {/* Joined date */}
                <td className="px-4 py-2 text-center">
                  {row.joined_date ? row.joined_date : <span className="text-gray-400 italic">No date</span>}
                </td>

                {/* Membership years */}
                <td className="px-4 py-2 text-center">
                  {(years || months || days)
                    ? `${years ? `${years}y ` : ""}${months ? `${months}m ` : ""}${days ? `${days}d` : ""}`
                    : <span className="text-gray-400 italic">Just joined</span>}
                </td>

                {/* Account Status */}
                <td className="px-4 py-2 text-center">
                  {row.status ? (
                    <span
                      className={`badge font-semibold ${row.status === "Active"
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
            )
          }}
        />

        <ViewMemberModal
          open={editModalOpen}
          close={closeModal}
          member={selectedMember}
          onSave={save}
          isSaving={isPending}
        >
          {memberGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-base-content">{group.title}</h3>
              <hr className="border-base-300 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field) => {
                  const isFullWidth = field.label === "Complete Address";

                  if (field.label === "Account Role / Type") {
                    return (
                      <div key={field.label} className={isFullWidth ? "col-span-2" : ""}>
                        <p className="text-base-content/70">{field.label}</p>
                        <select
                          className="select select-bordered w-full mt-1 bg-base-100 text-base-content"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          {["admin", "treasurer", "board", "regular-member", "associate-member"].map((acc_type) => (
                            <option key={acc_type} value={acc_type}>
                              {acc_type}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.label === "Account Status") {
                    return (
                      <div key={field.label} className={isFullWidth ? "col-span-2" : ""}>
                        <p className="text-base-content/70">{field.label}</p>
                        <select
                          className="select select-bordered w-full mt-1 bg-base-100 text-base-content"
                          value={accStatus}
                          onChange={(e) => setAccStatus(e.target.value)}
                        >
                          {["Active", "Inactive", "Revoked"].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.label} className={isFullWidth ? "col-span-2" : ""}>
                      <p className="text-base-content/70">{field.label}</p>
                      <p className="font-medium text-base-content">{field.value || "N/A"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </ViewMemberModal>
      </div>
    </div>
  );
}
export default UserManagement;