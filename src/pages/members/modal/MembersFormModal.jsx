import CloseIcon from '@mui/icons-material/Close';
import proptypes from 'prop-types';
function MembersFormModal({title, open, close, action, children, onSubmit, status, cancelAction, type, isPending, isAnyChanges }) { 

  // if open is false, don't render anything
  if (!open) return null
  return (
    <dialog open className='modal' onClose={close}>
      <div className="modal-box space-y-2 overflow-hidden min-h-[20rem] max-h-[90vh] max-w-sm md:max-w-2xl lg:max-w-3xl w-full mx-4">
        <div className="flex gap-2 justify-between" >
          <h2 className="text-lg lg:text-2xl font-semibold">{action ? `Edit ${title}` : `Submit ${title}`}</h2>
          <button type="button" className="btn btn-ghost" onClick={close}>
            <CloseIcon />
          </button>
        </div>
        
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
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {children}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            {action && (
              <button
                type="button"
                className="btn btn-error"
                disabled={status || isPending}
                onClick={cancelAction}
              >
                Cancel loan
              </button>
            )}
            <div className="flex gap-2 ml-auto">

              {onSubmit && (
                <button type="submit" className="btn btn-primary" disabled={status || isPending || isAnyChanges}>
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading...
                    </>
                  ) : (
                    type ? "Next" : "Submit"
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
MembersFormModal.propTypes = {
  title: proptypes.string.isRequired,
  open: proptypes.bool.isRequired,
  close: proptypes.func.isRequired,
  action: proptypes.bool,
  children: proptypes.node,
  onSubmit: proptypes.func,
  status: proptypes.bool,
  cancelAction: proptypes.func,
  type: proptypes.bool,
  isPending: proptypes.bool,
  isAnyChanges: proptypes.bool,
};

export default MembersFormModal
