import { useState } from "react";

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
  confirmRelease, // new prop: { show: boolean, message: string }
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  // if open is false, don't render anything
  if (!open) return null;

  // handle submit with confirmation
  const handleFormSubmit = (e) => {
    if (confirmRelease?.show) {
      e.preventDefault();
      setShowConfirm(true);
    } else {
      onSubmit(e);
    }
  };

  const handleConfirm = (e) => {
    setShowConfirm(false);
    onSubmit(e);
  };

  return (
    <dialog open className="modal" onClose={close}>
      <div className="modal-box space-y-6 overflow-visible w-[40rem] max-w-full">
        <h2 className="text-2xl font-semibold">{`${title}`}</h2>
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
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading...
                    </>
                  ) : (
                    type ? "Next" : "Release"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[24rem]">
              <h3 className="text-lg font-bold mb-2">Confirm Release</h3>
              <p className="mb-4">
                {confirmRelease?.message ||
                  "Are you sure you want to release this loan? This will generate the payment schedule."}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default BoardFormModal;