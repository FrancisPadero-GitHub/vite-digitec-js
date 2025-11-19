import PropTypes from "prop-types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format } from "date-fns";

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
}) {
  const badgeClass = getBadgeColor(type);

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Back Button (Placed at the top for immediate navigation) */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm self-start gap-2 text-primary hover:bg-base-200"
        aria-label="back-to-notifications"
      >
        <ArrowBackIcon fontSize="small" />
        Back to all notifications
      </button>

      {/* 2. Main Notification Card */}
      <div className="card w-full bg-base-200 border border-base-200">
        <div className="card-body">
          {/* Metadata Section: Type and Date/Time */}
          <div className="flex items-center justify-between border-b pb-4 mb-2">
            <span className={`badge ${badgeClass} text-md font-bold`}>
              {title || "Untitled Notification"}
            </span>
            {createdAt && (
              <span className="text-sm text-base-content/60">
                {format(new Date(createdAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            )}
          </div>

          {/*Message Content */}
          <div className="text-base text-base-content leading-relaxed">
            {message || "No message content was provided for this notification."}
          </div>

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
};

export default NotificationDetail;