import { useState, useMemo, useEffect } from "react";
import {Toaster, toast} from "react-hot-toast";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';


// redux stuff
import { useSelector, useDispatch } from "react-redux";
import { openModal, editModal, closeModal, modalData } from "../../features/redux/modalStateSlice";

// fetch hooks
// view table 
import { useFetchLoanAppView } from "../../backend/hooks/board/view/useFetchLoanAppView";

// base table
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchMemberId } from "../../backend/hooks/shared/useFetchMemberId";

// mutation hooks
import { useEditLoanApp } from "../../backend/hooks/board/useEditLoanApp";
import { useAddLoanAcc } from "../../backend/hooks/board/useAddLoanAcc";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// component
import MainDataTable from "../treasurer/components/MainDataTable";
import BoardFormModal from "./modal/BoardFormModal";
import LoanAccModal from "./modal/LoanAccModal";

// constants
import placeHolderAvatar from "../../assets/placeholder-avatar.png"
import { LOAN_APPLICATION_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";

// calculations
import calcLoanSchedFlat from "../../constants/calcLoanSchedFlat";
import calcLoanSchedDiminishing from "../../constants/calcLoanSchedDiminishing";

// utils
import { display } from "../../constants/numericFormat";

// HELPER FUNCTIONS & VARIABLES
// To avoid timezone issues with date inputs, we convert dates to local date strings
function getLocalDateString(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

// For the loan reference number generation
function generateAccountNumber(loanAppID) {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2); // last 2 digits of year
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const id = String(loanAppID).padStart(4, "0"); // 4 digits instead of 6
  const rand = Math.floor(10 + Math.random() * 90); // 2 digits
  return `L${y}${m}${d}-${id}${rand}`;
}

const TABLE_PREFIX = "LAPP_";
const STATUS_OPTIONS = ["Pending", "On Review", "Approved", "Denied"];




// JSX COMPONENT
function LoanApplicationsV2() {
  const today = getLocalDateString(new Date());

  // redux data state for later modals data population
  const dispatch = useDispatch();
  const modalState = useSelector(modalData)
  const state = modalState.isOpen;      // true or false
  const action = modalState.type;       // 'add' or 'edit'
  const mode = modalState.mode;         // 'loanAccount' | 'loanApplication' | 
  const redux_data = modalState.data;

  // Pagination params
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // data fetch
  const { memberRole } = useMemberRole();
  const { data: loanProducts } = useFetchLoanProducts();

  const { data: auth_member_id } = useFetchMemberId();    // Fetch board member id to store who updated the record
  const board_id = auth_member_id || null;

  const { data: view_loan_app, isLoading, isError, error } = useFetchLoanAppView({});
  const loanApplications = view_loan_app?.data || [];
  const total = loanApplications?.count || 0;

  // mutation hooks
  const { mutate: mutateUpdateLoanApp, isPending: isUpdateLoanAppPending } = useEditLoanApp();
  const { mutate: mutateAddLoanAcc, isPending: isAddLoanAccPending } = useAddLoanAcc();
  // the value here is for only queryInvalidation after deletion
  // it is different from the mutation call below from its values
  const { mutate: mutateDeleteLoanApp } = useDelete("loan_applications");  

  /**
   * Form Controls
   */

  // Loan Application Form
  const {
    register: registerLoanApp,
    handleSubmit: handleSubmitLoanApp,
    reset: resetLoanApp,
    watch: watchLoanApp,
    formState: { errors: errorsLoanApp, isDirty: isDirtyLoanApp },
  } = useForm({
    defaultValues: {
      application_id: null,
      account_number: "",
      full_name: "",
      product_name: "",
      amount: 0,
      purpose: "",
      loan_term: 0,
      reviewed_by: "",
      updated_at: today,
      application_date: today,
      status: "",
    }
  });

  // Loan Account Form
  const {
    register: registerLoanAcc,
    handleSubmit: handleSubmitLoanAcc,
    reset: resetLoanAcc,
    watch: watchLoanAcc,
    setValue: setLoanAccValue,
    formState: { errors: errorsLoanAcc },
  } = useForm({
    defaultValues: {
      loan_id: null,
      application_id: null,
      product_id: null,
      loan_ref_number: "",
      principal: 0,
      amount_req: 0,
      total_amount_due: 0,
      total_interest: 0,
      status: "",
      release_date: "",
      approved_date: today,
      maturity_date: "",
      first_due: "",
      service_fee: 0,

      // Front End Only Fields
      interest_rate: 0,
      loan_term: 0,
      interest_method: "",
      monthly_payment: 0,
    }
  });

  /**
   *  react hook form watch values
   */

  // to subscribe to the status field of form inputs to determine whether to proceed to loan account form or not
  // if this returns approve the Board Form modal would show Next button instead of Submit
  // this is the solution I can come up with right now
  const isLoanApproved = watchLoanApp("status")  === "Approved";

  // to get the principal amount input for calculation
  const principalInput = parseFloat(watchLoanAcc("principal")) ?? 0;

  // fetch to the loan product base on the data fetched from redux for min and max amount validation
  const loan_product_id = redux_data?.product_id || null;
  const selectedProduct = loanProducts?.find(product => product.product_id === loan_product_id) || null;
  // console.log("Selected Product: ", selectedProduct);


  /**
   * State Variables
   */

  // State for the condition to restrict the form to be deletable or editable if the loan is already approved
  const [isLoanAlreadyApproved, setIsLoanAlreadyApproved] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoanCancelled, setIsLoanCancelled] = useState(false);
 
  /**
   * Modal Controls
   */

  // Open Edit Modal
  const openEditModal = (selectedRow) => {
    resetLoanApp(selectedRow)
    setIsLoanCancelled(selectedRow.status === "Cancelled" ? true : false);
    setIsLoanAlreadyApproved(selectedRow.status === "Approved" ? true : false);
    dispatch(editModal({mode: 'loanApplication', data: selectedRow }));
  };

  // On Submit Loan Application Form
  const onSubmitLoanApp = (formDataLoanApp) => {
    if (formDataLoanApp.status === "Approved") {
      dispatch(openModal({mode: 'loanAccount', data: formDataLoanApp })); // open loan account modal next

      resetLoanAcc({
        ...formDataLoanApp,
        loan_ref_number: generateAccountNumber(formDataLoanApp.application_id),
        total_amount_due: 0, // to be calculated in the loan account modal
        service_fee: 0,     // to be calculated in the loan account modal
        status: "Pending Release",
        release_date: null,
        approved_date: today,
      });
    } else {
      mutateUpdateLoanApp({
            application_id: formDataLoanApp.application_id,
            reviewed_by: formDataLoanApp.reviewed_by,
            updated_at: today,
            status: formDataLoanApp.status,
          },
          {
          onSuccess: () => {
            toast.success("Loan application updated successfully.");
            resetLoanApp();
            dispatch(closeModal());
          },
          onError: (error) => {
            toast.error("Error updating loan application");
            console.error("Error updating loan application:", error);
          }
        }
      ); // directly submit the loan application edit if not approved
    }
  }

  // On Submit Loan Account Form
  const onSubmitLoanAcc = (formDataLoanAcc) => {
    // Form data in here contains the data being passed in line 201 during the resetLoanAcc({}) call
    mutateUpdateLoanApp({
      application_id: formDataLoanAcc.application_id,
      reviewed_by: formDataLoanAcc.reviewed_by,
      updated_at: today,
      status: "Approved", // set status to approved when loan account is created
    }, {
      onSuccess: () => {
        toast.success("Loan application updated successfully.");
        resetLoanApp();
        dispatch(closeModal());
      },
      onError: (error) => {
        toast.error("Error updating loan application");
        console.error("Error updating loan application:", error);
      }
    });
    
    mutateAddLoanAcc(formDataLoanAcc,
      {
        onSuccess: () => {
          toast.success("Loan account created successfully.");
          resetLoanAcc();
          dispatch(closeModal());
        },
        onError: (error) => {
          toast.error("Error creating loan account");
          console.error("Error creating loan account:", error);
        }
      }
    );

    console.log(`Data final submit`, formDataLoanAcc);
  };

  // Mark as delete Loan Application
  const loan_app_id = redux_data?.application_id || null;   // used below for delete function arguments
  const deleteLoanApp = (application_id) => {
    mutateDeleteLoanApp({
      table: "loan_applications",   // do not mark as delete form the view_loan_applications VIEW TABLE that is only for READ operations
      column_name: "application_id",
      id: Number(application_id),
    });
    closeLoanAppModal();
  };

  // Close Loan Application Modal
  const closeLoanAppModal = () => {
    resetLoanApp();
    setIsLoanAlreadyApproved(false);
    dispatch(closeModal());
  };


  // Close Loan Account Modal
  const closeLoanAccModal = () => {
    // Clear the account form
    resetLoanAcc();

    // Reopen the loan application modal with the previous redux data
    resetLoanApp({
      ...redux_data, // bring back previous application data
      reviewed_by: board_id
    }, {
      keepDirty: true // keep the dirty state so that user don't lose changes made 
    });

    // Switch the modal back to loanApplication mode
    dispatch(editModal({ mode: 'loanApplication', data: redux_data }));
  };

  /**
   * Calculations
   */
  const principalValue = principalInput;
  const interestRateValue = redux_data?.interest_rate || 0;
  const loanTermValue = redux_data?.loan_term || 0;
  const interestMethod = redux_data?.interest_method || "";
  const serviceFeeValue = redux_data?.service_fee || 0;

  // console.log(`TEST`, principalValue, interestRateValue, loanTermValue, interestMethod, serviceFeeValue);

  // detects the changes of principal then calculate on the go
  const calculatedLoan = useMemo(() => {

    // don't proceed if no principal value
    if (!principalValue || principalValue <= 0) return null;
    
    let totalPayable = 0;
    let totalInterest = 0;
    let totalServiceFee = 0;
    let totalMonthlyPayment = 0;

    if (interestMethod === "flat") {
      const result = calcLoanSchedFlat({
        interestRate: Number(interestRateValue),
        principal: Number(principalValue),
        termMonths: Number(loanTermValue),
        serviceFeeRate: Number(serviceFeeValue),
      });
      totalPayable = result.totalPayable;
      totalInterest = result.totalInterest;
      totalServiceFee = result.serviceFee;
      totalMonthlyPayment = result.monthlyPayment;
    } else if (interestMethod === "diminishing") {
      const result = calcLoanSchedDiminishing({
        interestRate: Number(interestRateValue),
        principal: Number(principalValue),
        termMonths: Number(loanTermValue),
        serviceFeeRate: Number(serviceFeeValue),
      });
      totalPayable = result.totalPayable;
      totalInterest = result.totalInterest;
      totalServiceFee = result.serviceFee;
      totalMonthlyPayment = result.monthlyPayment;
    } else {
      return null;
    }
    return { totalPayable, totalInterest, totalServiceFee, totalMonthlyPayment };
  }, [principalValue, interestMethod, interestRateValue, loanTermValue, serviceFeeValue]);


  /**
   * Use Effects
   */
  useEffect(() => {
    // update the calculated values to the form if changed
    // only proceed if there is a calculated loan
    if (!calculatedLoan) return;
    setIsCalculating(false);

    // function useMemo above returns these values
    const { totalPayable, totalInterest, totalServiceFee, totalMonthlyPayment } = calculatedLoan;

    const currentTotal = watchLoanAcc("total_amount_due");
    const currentInterest = watchLoanAcc("total_interest");
    const currentFee = watchLoanAcc("service_fee");
    const currentMonthlyPayment = watchLoanAcc("monthly_payment");

    if (
      currentTotal !== totalPayable ||
      currentInterest !== totalInterest ||
      currentFee !== totalServiceFee ||
      currentMonthlyPayment !== totalMonthlyPayment
    ) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setLoanAccValue("total_amount_due", totalPayable);
        setLoanAccValue("total_interest", totalInterest);
        setLoanAccValue("service_fee", totalServiceFee);
        setLoanAccValue("monthly_payment", totalMonthlyPayment);
        setIsCalculating(false);
      }, 300); // debounce time 300ms for smooth update and not jittery

      return () => clearTimeout(timer);
    }
   // The eslint-disable comment is to avoid warning for not including setLoanAccValue and watchLoanAcc in the dependency array
   // This is stable do not remove the dependency calculatedLoan
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedLoan]);


  // console.log(loanApplications)
  return (
    <div className="mb-6 space-y-4">
      <Toaster position="bottom-left" />
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Loan Applications</h1>

        <MainDataTable
          headers={["Account No.", "Full Name", "Loan Product", "Loan Amount", "Loan Term", "Application Date", "Status"]}
          data = {loanApplications}
          isLoading = {isLoading}
          isError = {isError}
          error = {error}
          page = {page}
          limit = {limit}
          total = {total}
          setPage={setPage}
          renderRow = {(row) => {
            const id = row?.application_id || "Not Found";
            const accountNo = row?.account_number || "Not Found";
            const avatarUrl = row?.avatar_url || "Not Found";
            const fullName = row?.full_name || "Not Found";
            const loanProduct = row?.product_name || false; // false since it is being checked as conditional if it has a value or not below
            const loanAmount = row?.amount || 0;    // display function only accepts numeric values
            const loanTerm = row?.loan_term || 0;
            const appDate = row?.application_date || false; 
            const appStatus = row?.status || false;

            return (
              <tr key={id} 
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openEditModal(row)}
              >
                {/* Account No. */}
                <td className="px-4 py-2 text-center text-xs font-medium">
                  {accountNo}
                </td>

                {/* Full Name */}
                <td className="px-4 py-2 text-center">
                  <span className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={avatarUrl || placeHolderAvatar}
                          alt={fullName}
                        />
                      </div>
                    </div>
                    <div className="truncate">
                      {fullName || 
                      <span className="text-gray-400 italic">
                        Not Provided
                      </span>}
                    </div>
                  </span>
                </td>

                {/* Loan Product */}
                <td className="px-4 py-2 text-center">
                  {loanProduct ? (
                    <span className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProduct]}`}>
                      {loanProduct}
                    </span>
                  ) : ( 
                      <span className="font-semibold text-error">Not Provided</span>
                  )}
                </td>


                {/* Loan Amount */}
                <td className="px-4 py-2 text-center">
                  ₱ {display(loanAmount)}  
                </td>

                {/* Loan Term */}
                <td className="px-4 py-2 text-center">
                  {loanTerm} months
                </td>

                {/* Application Date */}
                <td className="px-4 py-2 text-center">
                  {new Date(appDate).toLocaleDateString()}
                </td>

                {/* Status */}
                <td className="px-4 py-2 text-center">
                  {appStatus ? (
                    <span className={`badge font-semibold ${LOAN_APPLICATION_STATUS_COLORS[appStatus]}`}>
                      {appStatus}
                    </span>
                  ):(
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>

              </tr>
            )}}
        />

        <BoardFormModal 
          title={"Loan Application Details"}
          open={state && mode === 'loanApplication'}
          close={closeLoanAppModal}
          // disable form delete and submit/save button if loan is already approved or update is pending
          status={isLoanAlreadyApproved|| isUpdateLoanAppPending } 
          action={action === "edit"}
          deleteAction={() => deleteLoanApp(loan_app_id)}  // pass the application id to delete function
          onSubmit={handleSubmitLoanApp(onSubmitLoanApp)}
          isPending={isUpdateLoanAppPending}
          isDisabled={isLoanAlreadyApproved || !isDirtyLoanApp}
          // These two is to determine button text in the modal
          type={isLoanApproved} 
          memberRole={memberRole}
        >
          {/* Loan decision */}
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleOutlinedIcon fontSize="sma ll" color="info"/>
              <h3 className="font-bold">Application Decision</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              {STATUS_OPTIONS.map((status) => {
                // this only determines the colors of the buttons based on status
                const isSelected = watchLoanApp("status") === status;
                const isApproved = status === "Approved";
                const isDenied = status === "Denied";

                return (
                  <label
                    key={status}
                    className={`relative cursor-pointer px-3 py-2 rounded-lg font-semibold text-sm text-center transition-all border-2
                      ${isSelected 
                        ? isApproved 
                          ? 'bg-green-600 text-white border-green-600 shadow-lg scale-105' 
                          : isDenied
                          ? 'bg-red-600 text-white border-red-600 shadow-lg scale-105'
                          : 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }
                      ${isLoanAlreadyApproved ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      value={status}
                      {...registerLoanApp("status", { required: true })}
                      disabled={isLoanCancelled || isLoanAlreadyApproved}
                      className="sr-only"
                    />
                    {status}
                  </label>
                );
              })}
            </div>
  
            {watchLoanApp("status") === "Approved" && !isLoanAlreadyApproved && (
              <div className="p-3 bg-green-50 border border-green-300 rounded-lg flex items-start gap-2">
                <CheckCircleOutlinedIcon fontSize="small" color="success" />
                <p className="text-sm text-green-800">
                  <strong>Approved:</strong> Click "Next" to review and confirm loan release details.
                </p>
              </div>
            )}
  
            {watchLoanApp("status") === "Denied" && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
                <p className="text-sm text-red-800">
                  <strong>Denied:</strong> This application will be declined. The applicant will be notified.
                </p>
              </div>
            )}

            {watchLoanApp("status") === "Cancelled" && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
                <p className="text-sm text-red-800">
                  <strong>Cancelled:</strong> This application has been cancelled.
                </p>
              </div>
            )}
  
            {errorsLoanApp.status && (<p className="text-error text-sm mt-2">Application status is required</p>)}
          </div>
  
          {/* Application details (ref no, date, acc number, name) */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ref No.</label>
                <div className="text-sm font-mono font-bold text-gray-900">
                  {`${TABLE_PREFIX}${watchLoanApp("application_id") || ""}`}
                </div>
                <input type="hidden" {...registerLoanApp("application_id")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Application Date</label>
                <div className="text-sm font-semibold text-gray-900">
                  {watchLoanApp("application_date") && dayjs(watchLoanApp("application_date")).format("MMM D, YYYY")}
                </div>
                <input type="hidden" {...registerLoanApp("application_date")} />
              </div>
  
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account No.</label>
                <div className="text-sm font-semibold text-gray-900">{watchLoanApp("account_number")}</div>
                <input type="hidden" {...registerLoanApp("account_number")} />
              </div>
  
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Applicant Name</label>
                <div className="text-sm font-bold text-gray-900">{watchLoanApp("full_name")}</div>
                <input type="hidden" {...registerLoanApp("full_name")} />
              </div>
            </div>
          </div>
  
          {/* Loan details (product, term, amount) */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">Loan Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Loan Product</label>
                <div className="text-sm font-semibold text-gray-900 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                  {watchLoanApp("product_name") || "N/A"}
                </div>
                {errorsLoanApp.product_name && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>
  
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
                <div className="text-sm font-semibold text-gray-900 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                  {watchLoanApp("loan_term") ? `${watchLoanApp("loan_term")} months` : "N/A"}
                </div>
                {errorsLoanApp.loan_term && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>
  
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Amount Requested</label>
                <div className="px-4 py-1 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-lg font-bold text-blue-900">
                    ₱{watchLoanApp("amount") ? parseFloat(watchLoanApp("amount")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
                <input
                  type="hidden"
                  {...registerLoanApp("amount", {required: true, min: selectedProduct?.min_amount || 0, max: selectedProduct?.max_amount || 9999999,})}
                />
                {errorsLoanApp.amount && (<p className="text-error text-xs mt-1">Invalid amount range</p>)}
              </div>
            </div>
  
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-2 mt-2">Loan Purpose</label>
              <div className="text-sm text-gray-900 leading-relaxed px-3 py-2.5 bg-gray-50 rounded border border-gray-200">
                {watchLoanApp("purpose") || "No purpose provided"}
              </div>
              <textarea {...registerLoanApp("purpose", { required: false})} className="hidden" />
              {errorsLoanApp.purpose && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>
          </div>
          
        </BoardFormModal>




        <LoanAccModal
          title={"Loan Account Details"}
          open={state && mode === 'loanAccount'}
          close={closeLoanAccModal}
          status={isCalculating}
          isPending={isUpdateLoanAppPending || isAddLoanAccPending}
          onSubmit={handleSubmitLoanAcc(onSubmitLoanAcc)} // No operation on submit for now
        >
          {/* Loan Account details go here */}
          {/* Hidden fields */}
          <input type="hidden" {...registerLoanAcc("loan_id")} />

          {/* Approval Amount */}
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300 mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold">Approval Amount</h3>
              <p className="text-xs text-green-600 italic">(Adjust if needed)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount Requested</label>
                <div className="px-3 py-2 bg-white rounded border border-gray-200">
                  <div className=" font-bold text-gray-700">
                    ₱{watchLoanApp("amount") ? parseFloat(watchLoanApp("amount")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
                <input type="hidden" {...registerLoanAcc("amount_req", { required: true })} value={watchLoanApp("amount")} />
              </div>

              <div>
                <label className="block text-xs font-bold text-green-700 mb-1">Principal / Approval Amount</label>
                <input
                  type="number"
                  min="0"
                  {...registerLoanAcc("principal", {
                    required: true,
                    min: selectedProduct?.min_amount || 0,
                    max: selectedProduct?.max_amount || 9999999,
                  })}
                  placeholder={watchLoanApp("amount")}
                  className="input input-bordered w-full border-green-400 focus:border-green-600 font-bold"
                />
                {errorsLoanAcc.principal && (
                  <p className="text-error text-xs mt-2">
                    Amount must be between ₱{selectedProduct?.min_amount?.toLocaleString()} - ₱{selectedProduct?.max_amount?.toLocaleString()}
                  </p>
                )}
                {/**
                 * ISSUES: It has a weird bug where it is trying to control an uncontrolled input
                 * 
                 * Using Controller to manage the principal input with validation
                 * Rules:
                 * - Required
                 * - Min and Max based on selected product
                 * - Must be a number greater than 0
                 * 
                 */}
                {/* <Controller 
                  name="principal"
                  control={controlLoanAcc}
                  rules={{
                    required: "Principal amount is required",
                    min: {
                      value: selectedProduct?.min_amount || 1,
                      message: `Minimum amount is ₱${selectedProduct?.min_amount?.toLocaleString() || '1'}`,
                    },
                    max: {
                      value: selectedProduct?.max_amount || 9999999,
                      message: `Maximum amount is ₱${selectedProduct?.max_amount?.toLocaleString() || '9,999,999'}`,
                    },
                    validate: (value) => {
                      const numValue = Number(value);
                      if (isNaN(numValue) || numValue <= 0) {
                        return "Amount must be greater than 0";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <>                     
                      <input
                        id="principal"
                        type="number"
                        autoComplete="off"
                        value={field.value ?? ""}   // ← ensures it's never undefined
                        step="0.01"
                        min="1"
                        placeholder={watchLoanApp("amount")}
                        className={`input input-bordered w-full border-green-400
                          focus:border-green-600 font-bold ${errorsLoanAcc.principal ? "input-error" : ""}`}
                        {...field}
                        onChange={(e) => {
                          const raw = e.target.value;
                          // Allow empty input for clearing
                          if (raw === "") {
                            field.onChange("");
                            return;
                          }
                          // Parse and validate numeric input
                          const numValue = parseFloat(raw);
                          if (!isNaN(numValue) && numValue >= 0) {
                            field.onChange(numValue);
                          }
                        }}
                      />
                      {errorsLoanAcc.principal && (
                        <p className="text-error text-xs mt-2">
                          {errorsLoanAcc.principal.message || 
                            `Amount must be between ₱${selectedProduct?.min_amount?.toLocaleString() || '1'} - ₱${selectedProduct?.max_amount?.toLocaleString() || '9,999,999'}`
                          }
                        </p>
                      )}
                    </>
                  )}
                /> */}
              </div>
            </div>
          </div>

          {/* EDITABLE SECTION - Dates */}
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200 mb-4">
            <h3 className="font-bold mb-2">Loan Schedule</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">First Due / Start Date</label>
                <input
                  type="date"
                  defaultValue={dayjs().add(1, 'month').format('YYYY-MM-DD') || ""}
                  {...registerLoanAcc("first_due", { required: true })}
                  className="input input-bordered w-full border-blue-400 focus:border-blue-600"
                />
                {errorsLoanAcc.first_due && (<p className="text-error text-xs mt-1">Date required to calculate schedule</p>)}
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Maturity Date</label>
                <input
                  type="date"
                  defaultValue={dayjs().add(12, 'month').format('YYYY-MM-DD')}
                  {...registerLoanAcc("maturity_date", { required: true })}
                  className="input input-bordered w-full border-blue-400 focus:border-blue-600"
                />
                {errorsLoanAcc.maturity_date && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>
            </div>
          </div>

          {/* Application details (ref no, loan ref no, account no, name) */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
            <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Application Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ref No.</label>
                <div className="text-sm font-mono font-bold text-gray-900">
                  {`${TABLE_PREFIX}${watchLoanAcc("application_id") || ""}`}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Loan Ref No.</label>
                <div className="text-sm font-mono font-bold text-gray-900">{watchLoanAcc("loan_ref_number")}</div>
                <input type="hidden" {...registerLoanAcc("loan_ref_number")} />
                {errorsLoanAcc.loan_ref_number && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account No.</label>
                <div className="text-sm font-semibold text-gray-900">{watchLoanApp("account_number")}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Applicant</label>
                <div className="text-sm font-bold text-gray-900">{watchLoanApp("full_name")}</div>
              </div>
            </div>
          </div>

          {/* Loan Terms */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Loan Terms & Calculations</h4>

            {/* Interest info and status */}
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full border border-purple-200">
                <span className="text-xs font-medium text-gray-500">Interest Rate:</span>
                <span className="text-xs font-bold">{watchLoanAcc("interest_rate")}%</span>
                <input type="hidden" {...registerLoanAcc("interest_rate", { required: true })} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full border border-purple-200">
                <span className="text-xs font-medium text-gray-500">Loan Term:</span>
                <span className="text-xs font-bold">{watchLoanAcc("loan_term")} months</span>
                <input type="hidden" {...registerLoanAcc("loan_term", { required: true })} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-200">
                <span className="text-xs font-medium text-gray-500">Method:</span>
                <span className="text-xs font-bold">{watchLoanAcc("interest_method")}</span>
                <input type="hidden" {...registerLoanAcc("interest_method", { required: true })} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                <span className="text-xs font-medium text-gray-500">Status:</span>
                <span className="text-xs font-bold">{watchLoanAcc("status")}</span>
                <input type="hidden" {...registerLoanAcc("status")} />
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Service fee */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Service Fee</label>
                <div className={`relative px-4 py-2 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-2 border-purple-300 ${isCalculating ? "opacity-50" : ""}`}>
                  <div className="text-xl font-bold text-purple-900">
                    ₱{display(watchLoanAcc("service_fee")) || "0.00"}
                  </div>
                  {isCalculating && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 animate-spin">
                      <AiOutlineLoading3Quarters size={20} />
                    </span>
                  )}
                </div>
                <input type="hidden" {...registerLoanAcc("service_fee", { required: true })} />
              </div>

              {/* Total interest */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Interest</label>
                <div className={`relative px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 ${isCalculating ? "opacity-50" : ""}`}>
                  <div className="text-xl font-bold text-blue-900">
                    ₱{display(watchLoanAcc("total_interest")) || "0.00"}
                  </div>
                  {isCalculating && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin">
                      <AiOutlineLoading3Quarters size={20} />
                    </span>
                  )}
                </div>
                <input type="hidden" {...registerLoanAcc("total_interest", { required: true })} />
              </div>

              {/* Monthly amount due */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Due</label>
                <div className={`relative px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300 ${isCalculating ? "opacity-50" : ""}`}>
                  <div className="text-xl font-bold text-emerald-900">
                    ₱{display(watchLoanAcc("monthly_payment")) || "0.00"}
                  </div>
                  {isCalculating && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin">
                      <AiOutlineLoading3Quarters size={20} />
                    </span>
                  )}
                </div>
                <input type="hidden" {...registerLoanAcc("monthly_payment", { required: true })} />
              </div>


              {/* Total amount due */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount Due</label>
                <div className={`relative px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300 ${isCalculating ? "opacity-50" : ""}`}>
                  <div className="text-xl font-bold">
                    ₱{watchLoanAcc("total_amount_due") ? parseFloat(watchLoanAcc("total_amount_due")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                  {isCalculating && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 animate-spin">
                      <AiOutlineLoading3Quarters size={20} />
                    </span>
                  )}
                </div>
                <input type="hidden" {...registerLoanAcc("total_amount_due", { required: true })} />
              </div>

            </div>
          </div>
        </LoanAccModal>  

      </div>
    </div>
  )
}

export default LoanApplicationsV2