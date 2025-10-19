


function MembersFormModal({title, open, close, action, children, onSubmit, status, deleteAction, type }) { 

  // if open is false, don't render anything
  if (!open) return null
  return (
    <dialog open className='modal' onClose={close}>
      <div className="modal-box space-y-6 overflow-visible w-[40rem] max-w-full">
        <h2 className="text-2xl font-semibold">{action ? `Edit ${title}` : `Submit ${title}`}</h2>
        <form onSubmit={onSubmit}>
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
              <button type="button" className="btn btn-ghost" onClick={close}>{onSubmit ? "Cancel" : "Close"}</button>
              {onSubmit && (
                <button type="submit" className="btn btn-primary" disabled={status}>
                  {type ? "Next" : "Submit"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default MembersFormModal
