import { useState, useEffect, Fragment } from 'react'
import { useForm } from 'react-hook-form'
// fetch hooks
import { useFetchAnnouncement } from '../../backend/hooks/board/useFetchAnnouncements'

// mutation hooks
import { useSendAnnouncement } from '../../backend/hooks/board/useSendAnnouncemnt'
import { useEditAnnouncement } from '../../backend/hooks/board/useEditAnnouncement'

// MUI Icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';


function Announcement() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'edit'

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid }
  } = useForm({
    defaultValues: { message: '' },
    mode: 'onChange'
  });

  // Fetch announcements
  const { data: announcements, isLoading, isError, error } = useFetchAnnouncement();

  // Send announcement mutation
  const { mutate: sendAnnouncement, isPending: isSending } = useSendAnnouncement();

  // Edit announcement mutation
  const { mutate: editAnnouncement, isPending: isEditing } = useEditAnnouncement();

  const handleDoubleClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAnnouncement(null);
    reset({ message: '' });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setValue('message', selectedAnnouncement.message);
    setModalMode('edit');
  };

  // Update form when switching to edit mode
  useEffect(() => {
    if (modalMode === 'edit' && selectedAnnouncement) {
      setValue('message', selectedAnnouncement.message);
    }
  }, [modalMode, selectedAnnouncement, setValue]);

  const handleDelete = () => {
    console.log('Delete announcement:', selectedAnnouncement);
    // Add delete logic here
    setIsModalOpen(false);
  };

  const onSubmit = (data) => {
    if (modalMode === 'add') {
      sendAnnouncement(
        {
          message: data.message,
          type: "general",
          target: "all"
        },
        {
          onSuccess: () => {
            closeModal();
          }
        }
      );

    } else if (modalMode === 'edit') {
      editAnnouncement(
        {
          id: selectedAnnouncement.id,
          message: data.message,
          type: "general"
        },
        {
          onSuccess: () => {
            closeModal();
          }
        }
      );
    }
  };

  const handleCancel = () => {
    if (modalMode === 'edit') {
      setModalMode('view');
      reset();
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    setModalMode('view');
    reset({ message: '' });
  };

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={handleAddNew}
            >
              Send Announcement
            </button>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="bg-base-100 rounded-lg shadow-md">
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {isError && (
            <div className="alert alert-error m-4">
              <span>Error loading announcements: {error?.message}</span>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="max-h-[600px] overflow-y-auto">
              {announcements?.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No announcements found
                </div>
              ) : (
                announcements?.map((announcement) => (
                  <div
                    key={announcement.id}
                    onDoubleClick={() => handleDoubleClick(announcement)}
                    className="border-b border-base-300 p-4 hover:bg-base-200 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <CampaignIcon className="text-primary" fontSize="large" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge badge-primary badge-sm">
                            ID: {announcement.id}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(announcement.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {announcement.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Sender ID: {announcement.sender_id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {modalMode === 'add' && 'Send New Announcement'}
              {modalMode === 'edit' && 'Edit Announcement'}
              {modalMode === 'view' && 'Announcement Details'}
            </h3>

            <div className="space-y-4">
              {/* View Mode */}
              {modalMode === 'view' && selectedAnnouncement && (
                <>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">ID</span>
                    </label>
                    <p className="text-sm">{selectedAnnouncement.id}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Message</span>
                    </label>
                    <p className="text-sm whitespace-pre-wrap">{selectedAnnouncement.message}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Created At</span>
                    </label>
                    <p className="text-sm">
                      {new Date(selectedAnnouncement.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Sender ID</span>
                    </label>
                    <p className="text-sm">{selectedAnnouncement.sender_id}</p>
                  </div>
                </>
              )}

              {/* Add/Edit Mode */}
              {(modalMode === 'add' || modalMode === 'edit') && (
                <>
                  {modalMode === 'edit' && selectedAnnouncement && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">ID</span>
                      </label>
                      <p className="text-sm">{selectedAnnouncement.id}</p>
                    </div>
                  )}

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Message</span>
                    </label>
                    <textarea
                      className={`textarea textarea-bordered w-full h-32 ${errors.message ? 'textarea-error' : ''}`}
                      placeholder="Enter your announcement message..."
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters'
                        },
                        maxLength: {
                          value: 1000,
                          message: 'Message must not exceed 1000 characters'
                        }
                      })}
                    />
                    {errors.message && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.message.message}</span>
                      </label>
                    )}
                    <label className="label">
                      <span className="label-text-alt text-gray-500">
                        {getValues('message')?.length || 0} / 1000 characters
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="modal-action">
              {modalMode === 'view' && (
                <Fragment>
                  <button
                    className="btn btn-neutral"
                    onClick={closeModal}
                  >
                    <CloseIcon fontSize="small" />
                    Close
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={handleDelete}
                  >
                    <DeleteIcon fontSize="small" />
                    Delete
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleEdit}
                  >
                    <EditIcon fontSize="small" />
                    Edit
                  </button>

                </Fragment>
              )}

              {(modalMode === 'add' || modalMode === 'edit') && (
                <Fragment>
                  <button
                    className="btn btn-neutral"
                    onClick={handleCancel}
                    disabled={isSending || isEditing}
                  >
                    <CloseIcon fontSize="small" />
                    {isDirty ? 'Discard Changes' : 'Cancel'}
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isValid || !isDirty || isSending || isEditing}
                  >
                    {(isSending || isEditing) ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      modalMode === 'add' ? 'Send' : 'Save Changes'
                    )}
                  </button>

                </Fragment>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}

export default Announcement