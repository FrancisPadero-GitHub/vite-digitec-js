import PropTypes from "prop-types";
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Info,
  ListChecks,
  X,
} from "lucide-react";

function LoanApplicationInfo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between sticky top-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-6 h-6" />
            Loan Application Information
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-gray-700 leading-relaxed">
              Welcome to the DigiTEC loan application guide. Below are the
              products, eligibility rules, and how we calculate dues based on
              ECTEC bylaws and the current system logic.
            </p>
          </div>
          {/* Key Rules */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Eligibility & Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">Membership</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tenure: at least 1 year active membership</li>
                  <li>Age: minimum 18 years old</li>
                  <li>Share Capital: minimum ₱5,000</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">
                  Application Limits
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pending applications: max 2</li>
                  <li>Active loans: max 2 (no defaulted loans)</li>
                  <li>Loan amount range: ₱1,000 up to ₱25,000*</li>
                  <li>Loan term: up to 12 months</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              *LAD (Loan Against Deposit) limit: capped at 80% of share capital.
            </p>
          </div>
          {/* Loan Products Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Available Loan Products
            </h4>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-2">
                  Regular Loans
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  Standard loan products with fixed interest rates and flexible
                  terms. Suitable for general financing needs.
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Variable loan amounts based on product</li>
                  <li>Flexible repayment terms</li>
                  <li>Competitive interest rates</li>
                  <li>Service fee applies</li>
                </ul>
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Diminishing Balance (Regular Loan)
                  </p>
                  <p className="text-xs text-gray-600">
                    Interest is charged on the remaining balance each month, so
                    interest decreases and principal increases over time.
                    Monthly amortization uses the formula P × [ r(1+r)^n ] / [
                    (1+r)^n - 1 ], where r is monthly rate (annual ÷ 12). We
                    adjust the final installment for rounding.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">
                  Share Capital Loan
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  Special loan product based on your cooperative share capital
                  contributions.
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Loan amount based on your share capital balance</li>
                  <li>Percentage-based loanable amount calculation</li>
                  <li>Lower interest rates for members in good standing</li>
                  <li>Faster approval process</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              How We Show Your Loan Costs (Simple)
            </h4>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                We try to make the cost of a loan easy to understand. Before you
                submit an application the system will always show a clear
                breakdown so you know exactly what you&apos;ll pay each month
                and in total.
              </p>

              <div>
                <p className="font-semibold text-gray-800">What you will see</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Total principal — the amount you borrow.</li>
                  <li>
                    Service fee — a small one‑time fee taken when the loan is
                    released (1.75% of principal).
                  </li>
                  <li>
                    Interest — the charge for borrowing. It may be shown as a
                    flat rate or as a decreasing (diminishing) schedule
                    depending on the product.
                  </li>
                  <li>
                    Monthly due — the amount you pay each month (we show the
                    full payment schedule).
                  </li>
                  <li>
                    Final adjustment — tiny rounding differences are
                    automatically fixed on the last installment.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  Plain language explanation
                </p>
                <p className="text-sm text-gray-600">
                  - Flat interest: we calculate interest on the full loan for
                  the whole term and split it across months. This gives a fixed
                  monthly payment.
                  <br />- Diminishing balance: interest is charged on the
                  remaining balance, so interest falls as you pay — early
                  payments reduce interest faster.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800">Late payments</p>
                <p className="text-sm text-gray-600">
                  A small penalty (1% per month) is applied to overdue amounts.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                Example (simple):
                <div className="mt-1">
                  Borrow ₱10,000 for 10 months.
                  <br />
                  Service fee (1.75%) = ₱175. Flat interest (12% yearly) ≈
                  ₱1,200.
                  <br />
                  Total to repay ≈ ₱11,375 → Monthly ≈ ₱1,137.50 (we adjust the
                  final payment for rounding).
                </div>
              </div>

              <div className="text-sm text-gray-700">
                If anything looks unclear in the breakdown we show before you
                submit, contact the treasurer or board — we will explain each
                item in plain terms.
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Application Requirements
            </h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Active membership in good standing (To be emphasized more)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Minimum tenure requirement (check with administrator)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>No outstanding overdue loan payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Complete loan application form with purpose statement
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>
                    Valid identification documents (To be Implemented)
                  </span>
                </li>
              </ul>
            </div>
          </div>
          {/* Application Process */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-blue-600" />
              Application Process
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">
                    Select Loan Product
                  </h5>
                  <p className="text-sm text-gray-600">
                    Choose the loan product that best fits your needs. Review
                    the terms and conditions carefully.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">
                    Enter Loan Details
                  </h5>
                  <p className="text-sm text-gray-600">
                    Specify the amount you need and select your preferred
                    repayment term. The system will automatically calculate your
                    monthly payments.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">
                    Provide Purpose
                  </h5>
                  <p className="text-sm text-gray-600">
                    Clearly state the purpose of your loan. This helps the board
                    understand your needs.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">
                    Submit & Wait for Review
                  </h5>
                  <p className="text-sm text-gray-600">
                    After submission, your application will be reviewed by the
                    board. You&apos;ll receive updates on your application
                    status.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Important Notes */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="text-lg font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Important Notes
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">⚠</span>
                <span>
                  Ensure all information provided is accurate and complete
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">⚠</span>
                <span>Late or missed payments may incur penalty charges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">⚠</span>
                <span>
                  You can only have a limited number of active loan applications
                  at once
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">⚠</span>
                <span>
                  Contact the board or treasurer if you have questions about
                  your application
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoanApplicationInfo;

LoanApplicationInfo.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
