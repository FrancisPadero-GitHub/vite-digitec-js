import Proptypes from "prop-types";


/**
 * the {children} body would be where the form fields would go 
 * any design or even how many fields would be up to the parent component 
 */

/**
 * This is for guide on what kind of data is passed on to the modal props
 * 
 * @param {boolean} open - whether the modal is open or not
 * @param {function} close - function to call when the modal is closed
 * @param {boolean} action - whether the modal is for editing or adding
 * @param {React.ReactNode} children - the form fields to be rendered inside the modal
 * @param {function} onSubmit - function to call when the form is submitted
 * @param {function} deleteAction - function to call when the delete button is clicked
 * 
 */

function FormModal({ table, open, close, action, children, onSubmit, deleteAction, status, isPending}) {

  // if open is false, don't render anything
  if (!open) return null

  // Determine the title based on mode
  let title = table;
  if (onSubmit) {
    title = action ? `Edit ${table}` : `Add ${table}`;
  }

  return (
    <dialog open className='modal' onClose={close}>
      <div className="modal-box overflow-hidden min-h-[20rem] max-h-[90vh] max-w-sm sm:max-w-[25rem] md:max-w-[30rem] lg:max-w-[40rem] w-full">
        <p className="text-lg lg:text-2xl font-semibold" >{title}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Prevent double submit if already processing
            if (isPending || status) {
              return;
            }
            onSubmit(e);
          }}
        >
          {/* Control the paddings on the parent not here cause every modal usage is different for very pages */}
          <div className="max-h-[60vh] overflow-y-auto mb-4 mt-2">
            {children}
          </div>

          <div className="flex justify-between items-center gap-2">
            {action && (
              <button
                type="button"
                className="btn btn-error"
                disabled={isPending}
                onClick={deleteAction}
              >
                Delete
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button type="button" className="btn btn-ghost" onClick={close} disabled={isPending} >{onSubmit ? "Cancel" : "Close"}</button>
              {onSubmit && (
                <button type="submit" className="btn btn-primary" disabled={status || isPending}>
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading...
                    </>
                  ) : (
                    action ? "Save Changes" : "Submit"
                  )}  
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      {/* Backdrop enables outside click to close */}
      <form method="dialog" className="modal-backdrop" onSubmit={close}>
        <button aria-label="Close"></button>
      </form>
    </dialog>
  )
}
FormModal.propTypes = {
  table: Proptypes.string.isRequired,
  open: Proptypes.bool.isRequired,
  close: Proptypes.func.isRequired,
  action: Proptypes.bool,
  children: Proptypes.node,
  onSubmit: Proptypes.func,
  deleteAction: Proptypes.func,
  status: Proptypes.bool,
  isPending: Proptypes.bool,
};

export default FormModal
