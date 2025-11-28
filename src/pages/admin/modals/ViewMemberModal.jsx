import placeholderAvatar from "../../../assets/placeholder-avatar.png";

function ViewMemberModal({ open, close, member, children, onSave, isSaving }) {
  if (!open || !member) return null;

  return (
    <div className="modal modal-open" onClick={close}>
      <div
        className="modal-box max-w-sm md:max-w-3xl max-h-[90vh] overflow-y-auto space-y-6 w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <img
            src={member?.avatar_url || placeholderAvatar}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border-4 border-primary"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold flex items-center gap-2 truncate">
              {member?.displayName || "Unnamed Member"}
              {member?.account_number && (
                <span className="text-sm bg-base-200 text-gray-500 font-mono px-2 py-0.5 rounded">
                  {member.account_number}
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-sm truncate" title={member?.email || "No email"}>
              {member?.email || "No email"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewMemberModal;
