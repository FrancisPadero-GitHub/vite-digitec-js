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
 * @param {React.ReactNode} children - the form fields to be rendered inside the modal
 * @param {function} onSubmit - function to call when the form is submitted
 * @param {function} deleteAction - function to call when the delete button is clicked
 * 
 */

function LoanAccModal({ title, open, close, children, onSubmit, status, }) { // deleteAction


  // if open is false, don't render anything
  if (!open) return null
  return (
    <dialog open className='modal' onClose={close}>
      <div className="modal-box space-y-6 overflow-visible w-[40rem] max-w-full">
        <h2 className="text-2xl font-semibold">{`${title}`}</h2>
        <form onSubmit={onSubmit}>
          {children}

          <div className="flex justify-between items-center gap-2 mt-6">
            <div className="flex gap-2 ml-auto">
              <button type="button" className="btn btn-ghost" onClick={close}>{onSubmit ? "Back" : "Close"}</button>
              {onSubmit && (
                <button type="submit" className="btn btn-primary" disabled={status}>
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default LoanAccModal
