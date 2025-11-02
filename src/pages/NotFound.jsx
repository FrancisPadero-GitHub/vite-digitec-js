import { Link } from "react-router-dom";
import { useMemberRole } from "../backend/context/useMemberRole";

const NotFound = () => {
  const {memberRole} = useMemberRole();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-base-200 to-base-300 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Code */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-black text-error/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🔍</div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            Whoopsie! Page Not Found!
          </h2>
          <p className="text-lg md:text-xl text-base-content/70 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved to another location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link 
            to={`/${memberRole}`} 
            className="btn btn-primary btn-lg gap-2 min-w-[200px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn btn-ghost btn-lg gap-2 min-w-[200px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
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
