import PropTypes from "prop-types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { format } from "date-fns";

function NotificationDetail({
  message,
  type = "General",
  createdAt,
  // senderId,
  // recipientId,
  // isGlobal,
  onBack,
}) {
  return (
    <div className="space-y-4">
      {/* Emphasized message */}
      <div className="rounded-xl border border-base-300 bg-gradient-to-br from-base-200/80 to-base-100 p-5 shadow">
        <div className="tracking-tight text-base-content leading-snug">
          {message}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="badge badge-primary badge-sm">{type || "General"}</span>
          {createdAt && (
            <span className="text-xs text-base-content/60">
              {format(new Date(createdAt), "PPPp")}
            </span>
          )}
        </div>
      </div>

      {/* Minor details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* <div className="p-3 bg-base-200 rounded-lg">
          <div className="text-xs uppercase text-base-content/60">Sender</div>
          <div className="text-sm text-base-content">{senderId || "System"}</div>
        </div> */}
        {/* 
        <div className="p-3 bg-base-200 rounded-lg">
          <div className="text-xs uppercase text-base-content/60">Recipient</div>
          <div className="text-sm text-base-content">
            {recipientId || (isGlobal ? "Global" : "—")}
          </div>
        </div> */}
      </div>

      <button
        onClick={onBack}
        className="btn btn-outline btn-primary btn-sm w-full mt-2 gap-2"
      >
        <ArrowBackIcon fontSize="small" />
        Back to all notifications
      </button>
    </div>
  );
}

NotificationDetail.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  senderId: PropTypes.string,
  recipientId: PropTypes.string,
  isGlobal: PropTypes.bool,
  onBack: PropTypes.func,
};

export default NotificationDetail;
