import { useState } from "react";
import { useMembers } from "../../backend/hooks/useFetchMembers.js";


export default function UserManagement() {

  const { data: members, isLoading, isError, error } = useMembers();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) return <div>Loading members...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Users and Role Management</h1>
          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={""}
            >
              + Add Officer
            </button>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <div key={member.member_id}>
                    <tr
                      onClick={() => toggleExpand(member.member_id)}
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
                      <td className="flex gap-2">
                        <button className="btn btn-sm btn-primary">Edit</button>
                        <button className="btn btn-sm btn-error">Revoke</button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedId === member.member_id && (
                      <tr className="bg-base-100/70">
                        <td colSpan={5} className="p-4">
                          <div className="space-y-2">
                            <p>
                              <strong>Full Name:</strong> {member.f_name}{" "}
                              {member.m_name} {member.l_name}
                            </p>
                            <p>
                              <strong>Address:</strong>{" "}
                              {member.address || "Not provided"}
                            </p>
                            <p>
                              <strong>Birthday:</strong>{" "}
                              {member.birthday || "N/A"}
                            </p>
                            <p>
                              <strong>Employment:</strong>{" "}
                              {member.employment_status || "N/A"}
                            </p>
                            <p>
                              <strong>Description:</strong>{" "}
                              {member.description || "N/A"}
                            </p>
                            <p>
                              <strong>Joined:</strong>{" "}
                              {member.joined_date || "Pending"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </div>
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



      </div></>

  )
}
