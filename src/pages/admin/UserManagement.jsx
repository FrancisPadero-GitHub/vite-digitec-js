import React, { useState } from "react";
import { useMembers } from "../../backend/hooks/useFetchMembers.js";
import { Link } from "react-router-dom";


export default function UserManagement() {

  const { data: members, isLoading, isError, error } = useMembers();


  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  const openModal = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  if (isLoading) return <div>Loading members...</div>;
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
              + Add Members
            </Link>
          </div>
        </div>
        {/* Dropdown toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <label className="input input-bordered flex items-center bg-base-100 md:w-64">

            <input
              type="text"
              placeholder="Search..."
              className="grow"
              defaultValue=""
            />
          </label>

          {/* Dropdown #1 */}
          <select className="select select-bordered w-40">
            <option value="all">All Roles</option>
            <option value="treasurer">Treasurer</option>
            <option value="board">Board of Director</option>
          </select>

          {/* Dropdown #2 */}
          <select className="select select-bordered w-40">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        {/* Users Table */}
        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">

                  <th>ID</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>


                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <React.Fragment key={member.member_id}>
                    <tr
                      // ❌ WRONG: this *calls* openModal immediately during render which causes render loop
                      // onClick={openModal(member)}

                      // ✅ RIGHT: this creates a function that will call openModal *later*
                      onClick={() => openModal(member)}
                      className="cursor-pointer hover:bg-base-200/50"
                    >
                      <td>{member.member_id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-circle w-10 h-10">
                              <img
                                src={`https://i.pravatar.cc/40?u=${member.email}`}
                                alt={member.f_name}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">
                              {member.f_name} {member.l_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{member.account_type || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${member.account_status === "Active"
                            ? "badge-success"
                            : "badge-error"
                            }`}
                        >
                          {member.account_status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-base-content/5">
              <div className="text-sm text-base-content/70">
                Showing 1 to 3 of 3 entries
              </div>
              <div className="join">
                <button className="join-item btn btn-sm" disabled>
                  «
                </button>
                <button className="join-item btn btn-sm">Page 1 of 1</button>
                <button className="join-item btn btn-sm" disabled>
                  »
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>



      {/* This MODAL should render if editModalOpen is true */}
      {editModalOpen && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Member Information
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
