import PropTypes from "prop-types";
/**
 * the {children} body would be where the form fields would go
 * any design or even how many fields would be up to the parent component
 */

/**
 * This is for guide on what kind of data is passed on to the modal props
 *
 * @param {boolean} open - whether the modal is open or not
 * @param {function} close - function to call when the modal is closed
 * @param {React.ReactNode} children - the form fields to be rendered inside the modal
 * @param {function} onSubmit - function to call when the form is submitted
 * @param {function} deleteAction - function to call when the delete button is clicked
 *
 */

function LoanAccModal({
  title,
  open,
  close,
  children,
  onSubmit,
  status,
  isPending,
  isError,
}) {
  // deleteAction

  // if open is false, don't render anything
  if (!open) return null;
  return (
    <dialog open className="modal" onClose={close}>
      <div className="modal-box space-y-6 overflow-hidden max-w-sm md:max-w-[50rem] w-full mx-4">
        <h2 className="text-2xl font-semibold">{`${title}`}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Prevent double submit if already processing
            if (status || isPending) {
              return;
            }
            onSubmit(e);
          }}
        >
          {/* make form body scrollable to prevent overlap in smaller screens */}
          {/* Control the paddings on the parent not here cause every modal usage is different for very pages */}
          <div className="max-h-[60vh] overflow-y-auto mb-4 mt-2">
            {children}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={close}
                disabled={status || isPending}
              >
                {onSubmit ? "Back" : "Close"}
              </button>
              {onSubmit && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={status || isPending || isError}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}
LoanAccModal.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func,
  status: PropTypes.bool,
  isPending: PropTypes.bool,
  isError: PropTypes.bool,
};

export default LoanAccModal;
