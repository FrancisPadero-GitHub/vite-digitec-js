import React from 'react'
import EditIcon from '@mui/icons-material/Edit';
import { display } from '../../../constants/numericFormat';

function Products({
  data = [],
  isLoading,
  isError,
  error,
  onEdit,
}) {


  // Loading State
  if (isLoading) {
    return (
      <div>
        <div className="mt-3 p-3 bg-base-100 rounded-lg border border-gray-200">
          <div className="h-4 w-40 bg-gray-300 animate-pulse rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3 w-16 bg-gray-300 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (isError) {
    return (
      <div>
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5 text-red-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-red-800 mb-1">
                Error Loading Loan Product
              </h5>
              <p className="text-xs text-red-600">
                {error?.message || 'Failed to load loan terms and conditions. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty State - No Data
  if (!data || data.length === 0) {
    return (
      <div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center justify-center py-8">
            <svg 
              className="w-12 h-12 text-gray-400 mb-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
            <p className="text-sm text-gray-500 font-medium">No Loan Products Available</p>
            <p className="text-xs text-gray-400 mt-1">No loan products found in the system.</p>
          </div>
        </div>
      </div>
    )
  }


  // Success State - Display All Data Items
  return (
    <>
      {data.map((product, index) => (
        <div 
          key={product?.id || index} 
          className="mt-3 p-3 bg-base-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Header with Product Name and Edit Button */}
          <div className='flex justify-between items-center mb-2 pb-2 border-b border-gray-200'> 
            {/* Product Name/Title if available */}
            {product?.name && (
              <h4 className="text-sm font-bold text-base-content">
                {product?.name}
              </h4>
            )}
            
            {/* Edit Button */}
              <button
                onClick={() => onEdit(product)}   // is expecting the product in onEdit function
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Edit Loan Product"
              >
                <EditIcon className="text-gray-500 group-hover:text-blue-600" sx={{ fontSize: 18 }} />
              </button>

          </div>

          <h2 className="text-xs font-semibold text-base-content/70 mb-2">Loan Terms & Conditions</h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Interest Rate:</span>
              <span className="font-semibold text-blue-700">{display(product?.interest_rate)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Interest Method:</span>
              <span className="font-semibold">{product?.interest_method}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Penalty Rate:</span>
              <span className="font-semibold text-red-500">{display(product?.penalty_rate)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Repayment Frequency:</span>
              <span className="font-semibold">{product?.repayment_freq}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Service Fee:</span>
              <span className="font-semibold text-purple-700">{display(product?.service_fee)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/70">Loan Range:</span>
              <span className="font-bold text-green-700">
                ₱{display(product?.min_amount)} - ₱{display(product?.max_amount)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default Products