import { useFetchLoanProducts } from "../../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanAcc } from "./../../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../../backend/hooks/shared/useFetchLoanAccView"
import { useFetchPaySchedView } from "../../../backend/hooks/shared/useFetchPaySchedView"
import { useFetchLoanPaymentsView } from "../../../backend/hooks/shared/view/useFetchPaymentsView";

function LoanReports() {
  const { data: loan_products, isLoading: loanProductsLoading } = useFetchLoanProducts();
  const { data: loan_acc_data, isLoading: loanAccountsLoading } = useFetchLoanAcc({});
  const { data: view_loan_acc_data, isLoading: loanAccViewLoading } = useFetchLoanAccView({});
  const { data: loan_payment_scheds, isLoading: paySchedLoading } = useFetchPaySchedView({});
  const { data: loan_payments_data, isLoading: loanPaymentsLoading } = useFetchLoanPaymentsView({});

  // Loan Account data merged for easy viewing and query
  const loanProducts = loan_products || {};
  const loanAccData = loan_acc_data?.data || [];
  const viewLoanAccData = view_loan_acc_data?.data || [];
  const loanAccountInformation = viewLoanAccData.map(viewAcc => {
    const matchingAcc = loanAccData.find(acc => acc.loan_id === viewAcc.loan_id);
    const matchingProduct = loanProducts?.find(prod => prod.product_id === matchingAcc?.product_id) || {};
    return {  ...viewAcc, ...matchingAcc, ...matchingProduct };
  });
  console.log("Merged Loan Accounts Data:", loanAccountInformation);

  // Payment Schedules
  const paymentSchedules = loan_payment_scheds?.data || [];
  console.log("Payment Schedules Data:", paymentSchedules);

  // Overdue Loans
  const overdueLoans = loanAccountInformation.filter(loan => {
    const schedulesForThisLoan = paymentSchedules.filter(sched => sched.loan_ref_number === loan.loan_ref_number);
    return schedulesForThisLoan.some(sched => sched.mos_overdue > 0 && sched.paid === false && sched.payment_status === "OVERDUE");
  });
  console.log("Overdue Loans:", overdueLoans);

  // Loan Payments
  const loanPayments = loan_payments_data?.data || [];
  console.log("Loan Payments Data:", loanPayments);



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Loan Reports</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Loan Reports content goes here.</p>
      </div>
    </div>
  )
}

export default LoanReports
