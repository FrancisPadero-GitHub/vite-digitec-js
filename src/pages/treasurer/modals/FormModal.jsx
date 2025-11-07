import React from 'react'


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
      <div className="modal-box space-y-6 overflow-visible w-[40rem] max-w-full">
        <h2 className="text-2xl font-semibold" >{title}</h2>
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
          
          {children}

          <div className="flex justify-between items-center gap-2 mt-6">
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
    </dialog>
  )
}

export default FormModal
