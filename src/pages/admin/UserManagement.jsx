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



function UserManagement() {

  // custom states
  const { mutate: updateMemberRole, isPending } = useUpdateMember();

  // fetch all members with pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: members_data, isLoading, isError, error } = useMembers(page, limit);
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

  const openModal = (member) => {
    setSelectedMember(member);
    setNewRole(member.account_role);
    setEditModalOpen(true);
  };

  const save = () => {
    updateMemberRole({
      member_id: selectedMember.member_id,
      account_role: newRole,
    });
    setEditModalOpen(false);
  };

  const closeModal  =  () => {
    setEditModalOpen(false)
    setNewRole("")
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
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Revoked", value: "revoked" },
              ],
            },
          ]}
        />

        <MainDataTable
          headers={["ID", "User", "Role", "Status"]}
          data={members}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => (
            
            <tr
              key={`${TABLE_PREFIX}${row.member_id}`}
              onClick={() => openModal(row)}
              className="cursor-pointer hover:bg-base-200/70 transition-colors"
            >
              <td className="px-4 py-2 text-center text-info font-medium">
                {row.generatedId}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="avatar shrink-0">
                    <div className="mask mask-circle w-10 h-10">
                      <img
                        src={row.avatar || `https://i.pravatar.cc/40?u=${row.generatedId}`}
                        alt={row.displayName}
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{row.displayName}</div>
                    <div className="text-sm text-gray-500">{row.email || "No email"}</div>
                  </div>
                </div>
              </td>
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
              <td className="px-5 py-2 text-center">
                {row.status ? (
                  <span
                    className={`badge font-semibold ${row.status === "active"
                        ? "badge-success"
                        : row.status === "inactive"
                          ? "badge-ghost text-gray-500"
                          : row.status === "revoked"
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
          )}
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
              <h3 className="font-semibold text-lg mb-2">{group.title}</h3>
              <hr className="border-gray-300 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((field) => {
                  if (field.label === "Account Role / Type") {
                    return (
                      <div key={field.label}>
                        <p className="text-gray-500">{field.label}</p>
                        <select
                          className="select select-bordered w-full mt-1"
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
                  return (
                    <div key={field.label}>
                      <p className="text-gray-500">{field.label}</p>
                      <p className="font-medium text-gray-900">{field.value || "N/A"}</p>
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