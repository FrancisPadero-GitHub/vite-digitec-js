import { Link } from "react-router-dom";
const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-center">
      <h1 className="text-7xl font-bold text-error mb-2">404</h1>
      <p className="text-2xl text-base-content/80 mb-6">
        Whoopsie! Page Not Found!
      </p>
      <Link to="/" className="text-lg btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
