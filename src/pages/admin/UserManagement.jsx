import { useState } from "react";
import BaseTable from "../../components/BaseTable";
import BaseModal from "../../components/BaseModal";
import { filterBy, paginate } from "../../utils/tableHelpers";
import BaseTableToolbar from "../../components/BaseTableToolbar";
import dummyData from "../../mock/dummyData.json";
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const users = dummyData.officers;

  const filteredOfficers = filterBy(users, "role", roleFilter).sort((a, b) => {
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (a.status !== "Active" && b.status === "Active") return 1;
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);
  const paginatedData = paginate(filteredOfficers, currentPage, itemsPerPage);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPreviewAvatar(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const columns = [
    {
      key: "refNo",
      label: "ID",
      align: "center",
      render: (acc) => <span className="text-info">#{acc.userID}</span>,
    },
    {
      key: "user",
      label: "User",
      align: "left",
      render: (acc) => (
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={acc.avatar} alt={acc.username} />
            </div>
          </div>
          <div>
            <div className="font-semibold">{acc.username}</div>
            <div className="text-sm text-gray-500">{acc.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      align: "center",
      render: (acc) => (
        <span className="flex items-center justify-center gap-2 font-semibold">
          {acc.status === "Active" && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {acc.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (acc) => (
        <span
          className={`badge badge-outline font-semibold ${acc.status === "Active" ? "badge-success" : "badge-error"
            }`}
        >
          {acc.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (acc) => (
        <div className="flex justify-center gap-2">
          <button
            className="btn btn-sm btn-info"
            disabled={acc.status !== "Active"}
            onClick={() => { setEditEntry(acc); setShowModal(true); }}
          >
            <EditIcon fontSize="small" /> Edit
          </button>
          <button
            className="btn btn-sm btn-error"
            disabled={acc.status !== "Active"}
          >
            <BlockIcon fontSize="small" /> Revoke
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">User Access and Roles</h1>
          <div className="flex flex-row items-center gap-3">
            <BaseTableToolbar
              dropdowns={[
                {
                  value: roleFilter,
                  onChange: (val) => { setRoleFilter(val); setCurrentPage(1); },
                  options: [
                    { label: "All", value: "all" },
                    { label: "Treasurer", value: "Treasurer" },
                    { label: "Board of Director", value: "Board of Director" },
                  ],
                },
              ]}
            />
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={() => { setEditEntry(null); setShowModal(true); }}
            >
              + Add Officer
            </button>
          </div>
        </div>

        {/* USER ROLES TABLE */}
        <BaseTable
          columns={columns}
          data={paginatedData}
          totalItems={filteredOfficers.length}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {showModal && (
          <BaseModal
            open={showModal}
            title={editEntry ? "Edit Officer" : "Add Officer"}
            onClose={() => { setShowModal(false); setEditEntry(null); }}
            onSubmit={() => { setShowModal(false); setEditEntry(null); }}
          >
            <div className="w-full flex justify-center mb-6">
              <div className="avatar cursor-pointer relative group">
                <div className="w-24 h-24 rounded-full ring ring-neutral ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={
                      previewAvatar ||
                      editEntry?.avatar ||
                      "/src/assets/placeholder-avatar.png"
                    }
                    alt="User avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                  <CameraAltIcon fontSize="small" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label text-sm font-semibold">User Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                required
                defaultValue={editEntry?.username ?? ""}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label text-sm font-semibold">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                required
                defaultValue={editEntry?.email ?? ""}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label text-sm font-semibold">Role</label>
              <select
                className="input input-bordered w-full"
                required
                defaultValue={editEntry?.role ?? ""}
              >
                <option disabled value="">Select role</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Board of Director">Board of Director</option>
              </select>
            </div>

            {editEntry && (
              <div className="form-control mt-4">
                <label className="label text-sm font-semibold">Status</label>
                <select
                  className="input input-bordered w-full"
                  defaultValue={editEntry?.status}
                >
                  <option value="Active">Active</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>
            )}
          </BaseModal>
        )}
      </div>
    </>
  );
};

export default UserManagement;
