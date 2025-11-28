import PropTypes from "prop-types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useDispatch } from "react-redux";
import { closeNotificationModal } from "../../features/redux/notificationModalSlice";

// Function to conditionally determine the badge color based on type
const getBadgeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "alert":
    case "error":
      return "badge-error";
    case "warning":
      return "badge-warning";
    case "success":
      return "badge-success";
    case "info":
    default:
      return "badge-info";
  }
};

function NotificationDetail({
  title,
  message,
  type,
  createdAt,
  onBack,
  onNext,
  hasNext,
}) {
  const badgeClass = getBadgeColor(type);
  const navigate = useNavigate();
  const { memberRole } = useMemberRole();
  const dispatch = useDispatch();

  // Loan-related notification type check (derived, no state updates)
  const loanTypes = ["loan_application", "loan_application_status", "loan_approval"];
  const normalizedType = type?.toLowerCase();
  const isLoan = normalizedType ? loanTypes.includes(normalizedType) : false;


  const [path, setPath] = useState(null);

  // Fix: set path only when normalizedType changes, not in render body
  useEffect(() => {
    if (normalizedType === "loan_application") {
      setPath("loan-applications");
    }
  }, [normalizedType]);

  const handleViewLoanAccounts = () => {
    dispatch(closeNotificationModal());
    navigate(`/${memberRole}/coop-loans/${path || "loan-accounts"}`);
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Back Button (Placed at the top for immediate navigation) */}
      <div className="flex justify-between" >
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm self-start gap-2 text-primary hover:bg-base-200"
        aria-label="back-to-notifications"
      >
        <ArrowBackIcon fontSize="small" />
        Back to all notifications
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="btn btn-ghost btn-sm self-start gap-2 text-primary hover:bg-base-200 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="forward-to-next-notification"
        title={hasNext ? "Go to next notification" : "No more notifications"}
      >
        <ArrowForwardIcon fontSize="small" />
        Next notification
      </button>
      </div>


      {/* 2. Main Notification Card */}
      <div className="card w-full bg-base-200 border border-base-200">
        <div className="card-body">
          {/* Metadata Section: Type and Date/Time */}
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row justify-between border-b pb-4 mb-5">
            <span className={`badge ${badgeClass} text-md font-bold`}>
              {title || "Untitled Notification"}
            </span>
            {createdAt && (
              <span className="text-sm text-base-content/60 mt-2 sm:mt-0 md:mt-0 lg:mt-0">
                {format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            )}
          </div>

          {/*Message Content */}
          <div className="text-base text-base-content leading-relaxed">
            {message || "No message content was provided for this notification."}
          </div>
          {isLoan && (
            <div className="mt-1">
              {/* Render as an underlined link-style control instead of a button */}
              <div
                role="link"
                tabIndex={0}
                onClick={handleViewLoanAccounts}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleViewLoanAccounts();
                }}
                className="text-primary underline underline-offset-2 text-sm inline-flex items-center gap-2 cursor-pointer hover:text-primary/80"
                aria-label="View loan accounts"
              >
                <span>Go to Loan {normalizedType === "loan_application" ? "Applications" : "Accounts"}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

NotificationDetail.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  senderId: PropTypes.string,
  recipientId: PropTypes.string,
  isGlobal: PropTypes.bool,
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  hasNext: PropTypes.bool,
};

export default NotificationDetail;