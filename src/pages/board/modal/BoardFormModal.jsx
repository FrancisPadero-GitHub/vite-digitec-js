import PropTypes from "prop-types";

function BoardFormModal({
  title,
  open,
  close,
  children,
  onSubmit,
  status,
  action,
  deleteAction,
  type,
  isPending,
  isDisabled,
  memberRole,
}) {

  if (!open) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Button text based on role and type
  const getButtonText = () => {
    if (isPending) {
      return (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Loading...
        </>
      );
    }


    if (type) return "Next"; // When board picks "Approved" in decision, show "Next"
    if (memberRole === "board") return "Update"; //When board picks "Pending", "On Review", "Denied" in application decision
    if (memberRole === "treasurer") return "Release"; //When treasurer releases loan

    return "Submit";
  };

  return (
    <dialog open className="modal" onClose={close}>
      <div className="modal-box space-y-6 overflow-visible w-[45rem] max-w-full">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <form onSubmit={handleFormSubmit}>
          {children}

          <div className="flex justify-between items-center gap-2 mt-6">
            {action && (
              <button
                type="button"
                className="btn btn-error"
                disabled={status}
                onClick={deleteAction}
              >
                Delete
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" className="btn btn-ghost" onClick={close}>
                {onSubmit ? "Cancel" : "Close"}
              </button>
              {onSubmit && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status || isPending || isDisabled}
                >
                  {getButtonText()}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// 🛠 Prop Types for the expected values to be recieved or something2
BoardFormModal.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func,
  status: PropTypes.bool,
  action: PropTypes.func,
  deleteAction: PropTypes.func,
  type: PropTypes.string,
  isPending: PropTypes.bool,
  isDisabled: PropTypes.bool,
  memberRole: PropTypes.string,
};


export default BoardFormModal;