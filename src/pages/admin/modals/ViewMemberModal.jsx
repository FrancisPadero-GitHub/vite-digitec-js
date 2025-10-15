import placeholderAvatar from "../../../assets/placeholder-avatar.png";

function ViewMemberModal({ open, close, member, children, onSave, isSaving }) {
  if (!open || !member) return null;

  return (
    <div className="modal modal-open" onClick={close}>
      <div
        className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex-1">User Information</h2>
          <img
            src={member?.avatar_url || placeholderAvatar}
            alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border-3 border-primary"
          />
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
