import PropTypes from "prop-types";
import EditIcon from "@mui/icons-material/Edit";
import { display } from "../../../constants/numericFormat";
import { AlertCircle, Package } from "lucide-react";

function Products({ data = [], isLoading, isError, error, onEdit }) {
  // Loading State
  if (isLoading) {
    return (
      <div>
        <div className="mt-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="h-4 w-40 bg-gray-300 animate-pulse rounded mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-y-2 text-xs sm:text-sm">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3 w-16 bg-gray-300 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div>
        <div className="mt-3 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-red-800 mb-1">
                Error Loading Loan Product
              </h5>
              <p className="text-xs text-red-600">
                {error?.message ||
                  "Failed to load loan terms and conditions. Please try again."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State - No Data
  if (!data || data.length === 0) {
    return (
      <div>
        <div className="mt-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              No Loan Products Available
            </p>
            <p className="text-xs text-gray-400 mt-1">
              No loan products found in the system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Display All Data Items
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {data.map((product, index) => (
        <div
          key={product?.id || index}
          className="p-3 sm:p-4 bg-base-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Header with Product Name and Edit Button */}
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
            {/* Product Name/Title if available */}
            {product?.name && (
              <h4 className="text-sm sm:text-base font-bold text-base-content">
                {product?.name}
              </h4>
            )}

            {/* Edit Button */}
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group flex-shrink-0"
              title="Edit Loan Product"
            >
              <EditIcon
                className="text-gray-500 group-hover:text-blue-600"
                sx={{ fontSize: 18 }}
              />
            </button>
          </div>

          <h2 className="text-xs sm:text-sm font-semibold text-base-content/70 mb-3">
            Loan Terms & Conditions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-y-2 text-xs sm:text-sm">
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70">Interest Rate:</span>
              <span className="font-semibold text-blue-700">
                {display(product?.interest_rate)}%
              </span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70">Interest Method:</span>
              <span className="font-semibold">{product?.interest_method}</span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70">Penalty Rate:</span>
              <span className="font-semibold text-red-500">
                {display(product?.penalty_rate)}%
              </span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70">Repayment Frequency:</span>
              <span className="font-semibold">{product?.repayment_freq}</span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70">Service Fee:</span>
              <span className="font-semibold text-purple-700">
                {display(product?.service_fee)}%
              </span>
            </div>
            <div className="flex flex-col items-start gap-1 sm:gap-2">
              <span className="text-base-content/70 whitespace-nowrap">
                Loan Entitlement:
              </span>
              <span className="font-bold text-green-700 whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                ₱{display(product?.min_amount)} - ₱
                {display(product?.max_amount)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

Products.propTypes = {
  data: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.object,
};

export default Products;
