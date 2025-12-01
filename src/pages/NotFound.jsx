import { Link } from "react-router-dom";
import { useMemberRole } from "../backend/context/useMemberRole";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const { memberRole } = useMemberRole();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-error/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-base-content/70" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            Whoopsie! Page Not Found!
          </h2>
          <p className="text-lg md:text-xl text-base-content/70 max-w-md mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved to
            another location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link
            to={`/${memberRole}`}
            className="btn btn-primary btn-lg gap-2 min-w-[200px]"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-ghost btn-lg gap-2 min-w-[200px]"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Decorative Element */}
        <div className="pt-8 opacity-50">
          <p className="text-sm text-base-content/50">
            Error Code: 404 | Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
