import { useState, useEffect, Fragment, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
// fetch hooks
import { useFetchAnnouncement } from "../../backend/hooks/board/useFetchAnnouncements";

// mutation hooks
import { useSendAnnouncement } from "../../backend/hooks/board/useSendAnnouncemnt";
import { useEditAnnouncement } from "../../backend/hooks/board/useEditAnnouncement";
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

// Components
import FilterToolbar from "../shared/components/FilterToolbar";

// MUI Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";

function Announcement() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view', 'add', 'edit'

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: { message: "" },
    mode: "onChange",
  });

  // Fetch announcements
  const {
    data: announcements,
    isLoading,
    isError,
    error,
  } = useFetchAnnouncement();

  // Send announcement mutation
  const { mutate: sendAnnouncement, isPending: isSending } =
    useSendAnnouncement();

  // Edit announcement mutation
  const { mutate: editAnnouncement, isPending: isEditing } =
    useEditAnnouncement();

  const handleDoubleClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAnnouncement(null);
    reset({ message: "" });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setValue("message", selectedAnnouncement.message);
    setModalMode("edit");
  };

  // Update form when switching to edit mode
  useEffect(() => {
    if (modalMode === "edit" && selectedAnnouncement) {
      setValue("message", selectedAnnouncement.message);
    }
  }, [modalMode, selectedAnnouncement, setValue]);

  const handleDelete = () => {
    // console.log('Delete announcement:', selectedAnnouncement);
    // Add delete logic here
    setIsModalOpen(false);
  };

  const onSubmit = (data) => {
    if (modalMode === "add") {
      sendAnnouncement(
        {
          message: data.message,
          type: "general",
          target: "all",
        },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    } else if (modalMode === "edit") {
      editAnnouncement(
        {
          id: selectedAnnouncement.id,
          message: data.message,
          type: "general",
        },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    }
  };

  const handleCancel = () => {
    if (modalMode === "edit") {
      setModalMode("view");
      reset();
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    setModalMode("view");
    reset({ message: "" });
  };

  // Filter toolbar state and handlers
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (value) => {
    startTransition(() => setSearchTerm(value));
  };
  const handleYearChange = (value) => {
    startTransition(() => setYearFilter(value));
  };
  const handleMonthChange = (value) => {
    startTransition(() => setMonthFilter(value));
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setYearFilter("");
    setMonthFilter("");
  };

  const debouncedSearch = useDebounce(searchTerm, 250);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: (currentYear - i).toString(),
  }));
  const monthOptions = [
    { label: "January", value: "January" },
    { label: "February", value: "February" },
    { label: "March", value: "March" },
    { label: "April", value: "April" },
    { label: "May", value: "May" },
    { label: "June", value: "June" },
    { label: "July", value: "July" },
    { label: "August", value: "August" },
    { label: "September", value: "September" },
    { label: "October", value: "October" },
    { label: "November", value: "November" },
    { label: "December", value: "December" },
  ];

  const monthNameToNumber = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const filteredAnnouncements = useMemo(() => {
    const list = announcements || [];
    return list.filter((a) => {
      const msg = (a.message || "").toString();
      const created = a.created_at ? new Date(a.created_at) : null;
      const matchesSearch =
        debouncedSearch === "" ||
        msg.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        a.id.toLocaleString().includes(debouncedSearch) ||
        (a.sender_id && a.sender_id.toString().includes(debouncedSearch));

      const matchesYear =
        yearFilter === "" ||
        (created && created.getFullYear().toString() === yearFilter);
      const filterMonthNumber = monthFilter
        ? monthNameToNumber[monthFilter]
        : null;
      const matchesMonth =
        monthFilter === "" ||
        (created && created.getMonth() + 1 === filterMonthNumber);

      return matchesSearch && matchesYear && matchesMonth;
    });
  }, [announcements, debouncedSearch, yearFilter, monthFilter]);

  return (
    <div className="m-3">
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isFilterPending={isPending}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Year",
                value: yearFilter,
                onChange: handleYearChange,
                options: yearOptions,
              },
              {
                label: "All Month",
                value: monthFilter,
                onChange: handleMonthChange,
                options: monthOptions,
              },
            ]}
          />
          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap shadow-lg flex items-center gap-2 px-4 py-2 
                         fixed bottom-10 right-4 z-20 opacity-80 hover:opacity-100
                         lg:static lg:ml-auto lg:self-center lg:opacity-100"
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
          <h1 className="text-2xl font-semibold px-4 py-2">Announcements</h1>
          <div className="divider my-0"></div>
          {!isLoading && !isError && (
            <div className="max-h-[75vh] overflow-y-auto">
              {filteredAnnouncements?.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  No announcements found
                </div>
              ) : (
                filteredAnnouncements?.map((announcement) => (
                  <div
                    key={announcement.id}
                    onClick={() => handleDoubleClick(announcement)}
                    className="border-b border-base-300 p-4 hover:bg-base-200 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <CampaignIcon
                          className="text-primary"
                          fontSize="large"
                        />
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
                        <p className="text-xs text-gray-500 mt-1">
                          Receiver ID: {announcement.recipient_id}
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
          <div className="modal-box max-w-sm md:max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between pb-4 border-b border-base-300 flex-shrink-0">
              <h3 className="font-bold text-xl">
                {modalMode === "add" && "Send New Announcement"}
                {modalMode === "edit" && "Edit Announcement"}
                {modalMode === "view" && "Announcement Details"}
              </h3>
              {modalMode === "view" && (
                <div className="badge badge-primary badge-lg">
                  ID: {selectedAnnouncement?.id}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 py-4 pl-1 pr-2">
              {/* View Mode */}
              {modalMode === "view" && selectedAnnouncement && (
                <div className="space-y-4">
                  <div className="card bg-base-200">
                    <div className="card-body p-4">
                      <label className="label py-1">
                        <span className="label-text font-semibold text-base">
                          Message
                        </span>
                      </label>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedAnnouncement.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-semibold">
                          Created At
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-base-content/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm">
                          {new Date(
                            selectedAnnouncement.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-semibold">
                          Sender ID
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-base-content/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p className="text-sm font-mono">
                          {selectedAnnouncement.sender_id}
                        </p>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-semibold">
                          Recipient ID
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-base-content/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p className="text-sm font-mono">
                          {selectedAnnouncement.recipient_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Mode */}
              {(modalMode === "add" || modalMode === "edit") && (
                <div className="space-y-4">
                  {modalMode === "edit" && selectedAnnouncement && (
                    <div className="alert alert-info">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        Editing announcement ID:{" "}
                        <strong>{selectedAnnouncement.id}</strong>
                      </span>
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Message</span>
                      <span className="label-text-alt text-base-content/60">
                        {getValues("message")?.length || 0} / 1000
                      </span>
                    </label>
                    <textarea
                      className={`textarea textarea-bordered w-full h-40 ${errors.message ? "textarea-error" : ""} my-4`}
                      placeholder="Enter your announcement message..."
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 10,
                          message: "Message must be at least 10 characters",
                        },
                        maxLength: {
                          value: 1000,
                          message: "Message must not exceed 1000 characters",
                        },
                      })}
                    />
                    {errors.message && (
                      <label className="label">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {errors.message.message}
                        </span>
                      </label>
                    )}
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Write a clear and concise announcement for all members
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex justify-between pt-4 border-t border-base-300 mt-4 flex-shrink-0">
              {modalMode === "view" && (
                <Fragment>
                  <button
                    className="btn btn-sm sm:btn-md btn-ghost gap-2"
                    onClick={closeModal}
                  >
                    <CloseIcon fontSize="small" />
                    <span className="hidden sm:inline">Close</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm sm:btn-md btn-error gap-2"
                      disabled
                      onClick={handleDelete}
                    >
                      <DeleteIcon fontSize="small" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                    <button
                      className="btn btn-sm sm:btn-md btn-primary gap-2"
                      onClick={handleEdit}
                    >
                      <EditIcon fontSize="small" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>
                </Fragment>
              )}

              {(modalMode === "add" || modalMode === "edit") && (
                <Fragment>
                  <button
                    className="btn btn-sm sm:btn-md btn-ghost gap-2"
                    onClick={handleCancel}
                    disabled={isSending || isEditing}
                  >
                    <CloseIcon fontSize="small" />
                    <span className="hidden sm:inline">
                      {isDirty ? "Discard" : "Cancel"}
                    </span>
                  </button>

                  <button
                    className="btn btn-sm sm:btn-md btn-primary gap-2"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isValid || !isDirty || isSending || isEditing}
                  >
                    {isSending || isEditing ? (
                      <Fragment>
                        <span className="loading loading-spinner loading-sm"></span>
                        <span className="hidden sm:inline">Processing...</span>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="hidden sm:inline">
                          {modalMode === "add" ? "Send" : "Save Changes"}
                        </span>
                      </Fragment>
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
  );
}

export default Announcement;
