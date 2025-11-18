import { useEffect, useRef } from "react";
import { useFetchMemberId } from "../../backend/hooks/shared/useFetchMemberId";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

function MemberReports() {
  const navigate = useNavigate();
  const { data: memberId, isLoading, isError } = useFetchMemberId();
  const errorToastShown = useRef(false);

  // Navigate when memberId is available
  useEffect(() => {
    if (memberId) {
      navigate(`/regular-member/reports/member-statement-details/${memberId}`, { replace: true });
    }
  }, [memberId, navigate]);

  // Show error toast once if finished loading and no memberId
  useEffect(() => {
    if (!isLoading && !isError && !memberId && !errorToastShown.current) {
      toast.error("Member ID is not available");
      errorToastShown.current = true;
    }
  }, [isLoading, isError, memberId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3" role="status" aria-live="polite">
          <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="text-xl">Loading member report...</div>
        </div>
        <Toaster position="bottom-left" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Failed to fetch member ID.</div>
        <Toaster position="bottom-left" />
      </div>
    );
  }

  // While navigating (memberId present) we can show nothing or a minimal placeholder
  if (memberId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Redirecting...</div>
        <Toaster position="bottom-left" />
      </div>
    );
  }

  // No memberId after fetch
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-gray-600">Member ID not found.</div>
      <Toaster position="bottom-left" />
    </div>
  );
}

export default MemberReports
