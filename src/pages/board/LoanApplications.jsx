import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Toaster } from "react-hot-toast";
import { usePrompt } from "../shared/components/usePrompt";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import dayjs from 'dayjs';

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanApp } from "../../backend/hooks/shared/useFetchLoanApp";
import { useFetchMemberId } from "../../backend/hooks/shared/useFetchMemberId";
import { useFetchSettings } from "../../backend/hooks/shared/useFetchSettings";
import { useAuth } from "../../backend/context/AuthProvider";

// mutation hooks
import { useEditLoanApp } from "../../backend/hooks/board/useEditLoanApp";
import { useAddLoanAcc } from "../../backend/hooks/board/useAddLoanAcc";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import BoardFormModal from "./modal/BoardFormModal";
import LoanAccModal from "./modal/LoanAccModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import calculateLoanAndScheduleFlatRate from "../../constants/calculateLoanAndScheduleFlatRate";
import calculateLoanAndScheduleReducing from "../../constants/calculateLoanAndScheduleReducing";

import { LOAN_APPLICATION_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";
const catGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTVsM3VoOHU1YWpqMjM0ajJ3bTBsODVxbnJsZDIzdTRyajBrazZ0MyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/qZgHBlenHa1zKqy6Zn/giphy.gif"



function LoanApplications() {
  const { showPrompt } = usePrompt();
  // const navigate = useNavigate();
  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetches data 
  const { data: settingsData } = useFetchSettings();
  const serviceFeeRate = settingsData?.loan_service_fee || 0;

  const {data: auth_member_id} = useFetchMemberId();    // used by the one who reviewed the loan application

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  
  const { data: loan_acc_data } = useFetchLoanAcc({page, limit});
  const loanAcc = loan_acc_data?.data || [];

  const { data: loanProducts } = useFetchLoanProducts();
  const { data: memberLoanAppData, isLoading, isError, error } = useFetchLoanApp({page, limit});

  const { role: memberRole } = useAuth();

  // Data manipulation 
  const { mutate: addLoanAcc } = useAddLoanAcc();


  const loanDataRaw = memberLoanAppData?.data || [];
  const total = loanDataRaw?.count || 0;

  /**
 * Grab the application_id in loan application then checks it if it exists on loan accounts
 * used to conditionally render disabled inputs and selects and status on form modal
 */
  const [loanStatus, setLoanStatus] = useState(false);

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const TABLE_PREFIX = "LAPP_";

  const memberLoanApplications = loanDataRaw.filter((row) => {

    const member = members?.find((m) => m.account_number === row.account_number);
    const fullName = member
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const generatedId = `${TABLE_PREFIX}${row.application_id}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.amount?.toString().includes(searchTerm) ||
      row.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || row.status === statusFilter;
   
    const date = row.application_date ? new Date(row.application_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesStatus && matchesYear && matchesMonth;
  });

  // mutations
  const { mutate: mutateEdit } = useEditLoanApp();
  const { mutate: mutateDelete } = useDelete("loan_applications"); 

  const [showLoanAccModal, setShowLoanAccModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const [modalType, setModalType] = useState(null);
  const STATUS_OPTIONS = ["Pending", "On Review", "Approved", "Denied"];

  // To avoid timezone issues with date inputs, we convert dates to local date strings
  function getLocalDateString(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  }

  const today = getLocalDateString(new Date());


  const defaultValuesLoanApp = {
    application_id: null,
    account_number: null,
    applicant_name: "",
    loan_product: "",
    amount: "",
    purpose: "",
    term_months: "",
    reviewed_by: null,
    application_date: today,
    status: "",
  }

  // React Hook Form setup for loan applications 
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValuesLoanApp
  });

  const defaultValuesLoanAcc = {
      loan_id: null,
      application_id: null,
      loan_ref_number: null,
      product_id: null,
      principal: 0,
      amount_req: 0,
      total_amount_due: "",
      interest_rate: "", // front_end only
      total_interest: 0,
      loan_term: "", // front_end only
      interest_method: "", // front_end only
      status: "",
      release_date: null, // will be configured by treasurer
      approved_date: today,
      maturity_date: "",
      first_due: "",
      service_fee: 0,
    }

  // React Hook Form setup for Loan Accounts
  const {
    register: registerLoanAcc,
    handleSubmit: handleSubmitLoanAcc,
    reset: resetLoanAcc,
    watch: watchLoanAcc,
    setValue: setLoanAccValue,
    formState: { errors: errorsLoanAcc },
  } = useForm({
    defaultValuesLoanAcc
  });

  // for the total amount due input auto calculation
  const [isCalculating, setIsCalculating] = useState(false);
  const principalValue = watchLoanAcc("principal");
  const totalAmount = watchLoanAcc("total_amount_due")
  const interestMethod = watchLoanAcc("interest_method")
  const interestRateValue = watchLoanAcc("interest_rate");
  const loanTermValue = watchLoanAcc("loan_term");
  const startDateValue = watchLoanAcc("first_due");

  // detect the changes of principal then calculate on the go
  useEffect(() => {
    if (!principalValue || principalValue <= 0) return;
    // console.log(`TEST`, interestMethod )
    setIsCalculating(true);
    const timer = setTimeout(() => {
      let totalPayable = 0;
      let totalInterest = 0;
      let serviceFee = 0;

      if (interestMethod === "Flat Rate") {
        const result = calculateLoanAndScheduleFlatRate({
          interestRate: Number(interestRateValue),
          principal: Number(principalValue),
          termMonths: Number(loanTermValue),
          serviceFeeRate: Number(serviceFeeRate),
        });
        totalPayable = result.totalPayable;
        totalInterest = result.totalInterest;
        serviceFee = result.serviceFee;
      } else if (interestMethod === "Reducing") {
        const result = calculateLoanAndScheduleReducing({
          interestRate: Number(interestRateValue),
          principal: Number(principalValue),
          termMonths: Number(loanTermValue),
          serviceFeeRate: Number(serviceFeeRate),
        });
        totalPayable = result.totalPayable;
        totalInterest = result.totalInterest;
        serviceFee = result.serviceFee;
      }

      setLoanAccValue("total_amount_due", totalPayable);
      setLoanAccValue("total_interest", totalInterest);
      setLoanAccValue("service_fee", serviceFee);
      setIsCalculating(false);

    }, 600); // debounce delay (ms)

    return () => clearTimeout(timer);
  }, [principalValue, interestRateValue, loanTermValue, interestMethod, setLoanAccValue, serviceFeeRate]);

  // detect changes in start date or loan term to auto calculate maturity date
  useEffect(() => {
    if (!startDateValue || !loanTermValue) return;

    const startDate = new Date(startDateValue);
    const monthsMaturity = Number(loanTermValue);

    // Add months directly to the original date
    const maturity = new Date(startDate);
    maturity.setMonth(maturity.getMonth() + monthsMaturity - 1); // - 1 to account for first due month in payment schedule generation

    // If the day overflows (e.g., Feb 30), set to last day of month
    if (maturity.getDate() !== startDate.getDate()) {
      maturity.setDate(0); // go to last day of previous month
    }

    const maturityDate = maturity.toISOString().split("T")[0];
    setLoanAccValue("maturity_date", maturityDate);
  }, [startDateValue, loanTermValue, setLoanAccValue]);

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct);



  const openEditModal = (selectedRow) => {
    // console.log("eid", selectedRow.product_id)
    
    const matchedMember = members?.find(
      (member) => member.account_number === selectedRow.account_number
    );

    const fullName = matchedMember
      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
      : "";

    const matchedLoanProduct = loanProducts?.find(
      (product) => product.product_id === selectedRow.product_id
    );

    const loanTerm = Number(matchedLoanProduct?.max_term_months) || 0;

    const status = watch("status")

    // displays
    reset({
      ...selectedRow,
      ...(status === "On Review" && { reviewed_by: auth_member_id }), 
      reviewed_by: auth_member_id,
      applicant_name: fullName,
      loan_product: matchedLoanProduct?.name || "",
      term_months: loanTerm,
    });

    setLoanStatus(loanAcc?.some((loan) => loan.application_id === watch("application_id")))
    // console.log(loanAcc?.some((loan) => loan.application_id === selectedRow.application_id))
    setModalType("edit");
  };

  const closeModal = () => {
    setLoanStatus(false);
    setModalType(null)
  }

  // Delete handler
  const handleDelete = (application_id) => {
    mutateDelete({
      table: "loan_applications",
      column_name: "application_id",
      id: Number(application_id),
    });
    closeModal();
  };


  // State to hold the edit application data temporarily
  // this is for the edit loan applications where the status is not "Approved"
  const [pendingAppData, setPendingAppData] = useState(null);

  // Submit handler (edit)

  /**
   * NOTE: When you submit as a "APPROVED" it will go to loan acc form modal and the values of it is not submitted yet but stored to
   * pendingAppData ot be later submitted on below
   * 
   * now the values here in resetLoanAcc will be set to the loanAccFormModal
   */
  const onSubmit = (data) => {
    const generateAccountNumber = (appId) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const paddedId = String(appId).padStart(6, "0");
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      return `LAPP-${year}${month}${day}-${paddedId}${randomSuffix}`;
    };

    if (data.status === "Approved") {
      const row = loanDataRaw.find(
        (item) => item.application_id === data.application_id
      );

      const matchedLoanProduct = loanProducts?.find(
        (product) => product.product_id === row.product_id
      );

      const interestRate = Number(matchedLoanProduct?.interest_rate) || 0;
      const interestMethod = matchedLoanProduct?.interest_method ?? "";
      const loanTerm = Number(matchedLoanProduct?.max_term_months);

      resetLoanAcc({
        ...data,
        loan_id: null,
        product_id: matchedLoanProduct?.product_id ?? null,
        loan_ref_number: generateAccountNumber(data.application_id),
        total_amount_due: totalAmount,
        interest_rate: interestRate,
        interest_method: interestMethod,
        loan_term: loanTerm,
        status: "Pending Release",
        release_date: null,
        approved_date: today,
      });

      // store the application data for later mutation for the edit on loan application
      setPendingAppData(data); // loan_acc data

      setSelectedApplicationId(data.application_id);
      setShowLoanAccModal(true);
    } else {
      mutateEdit(data,
        {
          onSuccess: () => {
            showPrompt("success", "Updated Loan Application")
          },
          onError: () => {
            showPrompt("error", "Failed to update loan application.") 
          }
        });
      // console.log("EDITED DATA", data )
      closeModal();
    }
  };


  // Loan Accounts handler
  // This is the last one to be submitted if the status is for approval
  const onSubmitLoanAcc = (loanAccData) => {
    // console.log(`TEST`, loanAccData )

    // 1. Create the loan account

    addLoanAcc(loanAccData,
      {
        onSuccess: () => {
          showPrompt("success", "Loan Application Approved!",)
        },
        onError: () => {
          showPrompt("error", "Failed to approve loan application.")
        }
      }
    );

    // 2. Mutate the original application too (if it's pending)
    
    if (pendingAppData) {
      mutateEdit(pendingAppData,
        {
          onSuccess: () => {
            showPrompt("success", "Updated Loan Application")
            setPendingAppData(null); // clear it after use
            setShowLoanAccModal(false);
            closeModal();
          },
          onError: () => {
            showPrompt("error", "Failed to update loan application.")
          }
        });
    }
  };

  return (
    <div>
      <Toaster position="bottom-left"/>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Members Loan Applications</h1>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "All Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "Pending", value: "Pending" },
                { label: "On Review", value: "On Review" },
                { label: "Approved", value: "Approved" },
                { label: "Denied", value: "Denied" },

              ],
            },
            {
              label: "All Year",
              value: yearFilter,
              onChange: setYearFilter,
              options: [
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
              ],
            },
            {
              label: "All Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "January", value: "1" },
                { label: "February", value: "2" },
                { label: "March", value: "3" },
                { label: "April", value: "4" },
                { label: "May", value: "5" },
                { label: "June", value: "6" },
                { label: "July", value: "7" },
                { label: "August", value: "8" },
                { label: "September", value: "9" },
                { label: "October", value: "10" },
                { label: "November", value: "11" },
                { label: "December", value: "12" },
              ],
            },
          ]}
        />

        <MainDataTable
          headers={[
            "Ref No.",
            "Account No.",
            "Name",
            "Loan Product",
            "Amount",
            "Term",
            "Application Date",
            "Status",
          ]}
          data={memberLoanApplications}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {

            // This is dynamic to query columns from foreign keys 
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number
            );
            
            // 
            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );

            const loanProductName = matchedLoanProduct?.name;
            const loanTerm = matchedLoanProduct?.max_term_months.toLocaleString();

            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";

            return (
              <tr
                key={`${TABLE_PREFIX}${row.application_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openEditModal(row)}
              >
                {/* Application ID */}
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {TABLE_PREFIX}{row.application_id?.toLocaleString() || "ID"}
                </td>
                {/* Account Number */}
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {row.account_number || "Not Found"}
                </td>
                {/* Full name + avatar */}
                <td className="px-4 py-4">
                    <span className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-circle w-10 h-10">
                          <img
                            src={matchedMember?.avatar_url || catGif}
                            alt={fullName}
                          />
                        </div>
                      </div>
                      <div className="truncate">{fullName || <span className="text-gray-400 italic">Not Provided</span>}</div>
                    </span>
                </td>

                {/* Product Name*/}
                <td className="px-4 py-2 text-center">
                  {loanProductName ? (
                    <span className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}>
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="font-semibold text-error">Not Provided</span>
                  )}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success px-4 py-2 text-center">₱ {row.amount?.toLocaleString() || "0"}</td>
                 {/* Loan term */}
                <td className="px-4 py-2 text-center">{loanTerm || "Not Found"} Months</td>
                 {/* Application Date */}
                <td className="px-4 py-2 text-center">
                  {row.application_date
                    ? new Date(row.application_date).toLocaleDateString()
                    : "Not Found"}
                </td>
                {/* Status */}
                <td className="px-4 py-4 text-center">
                  {row.status ? (
                    <span className={`badge font-semibold ${LOAN_APPLICATION_STATUS_COLORS[row.status]}`}>
                      {row.status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
              </tr>
            );
          }}
        />

      <BoardFormModal
        title={"Loan Application Review"}
        open={modalType !== null}
        close={closeModal}
        status={loanStatus}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() => handleDelete(watch("application_id"))}
        type={watch("status") === "Approved"}
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
              const isSelected = watch("status") === status;
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
                    ${loanStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    value={status}
                    {...register("status", { required: true })}
                    disabled={loanStatus}
                    className="sr-only"
                  />
                  {status}
                </label>
              );
            })}
          </div>

          {watch("status") === "Approved" && !loanStatus && (
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg flex items-start gap-2">
              <CheckCircleOutlinedIcon fontSize="small" color="success" />
              <p className="text-sm text-green-800">
                <strong>Approved:</strong> Click "Next" to review and confirm loan release details.
              </p>
            </div>
          )}

          {watch("status") === "Denied" && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <p className="text-sm text-red-800">
                <strong>Denied:</strong> This application will be declined. The applicant will be notified.
              </p>
            </div>
          )}

          {errors.status && (<p className="text-error text-sm mt-2">Application status is required</p>)}
        </div>

        {/* Application details (ref no, date, acc number, name) */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ref No.</label>
              <div className="text-sm font-mono font-bold text-gray-900">
                {`${TABLE_PREFIX}${watch("application_id") || ""}`}
              </div>
              <input type="hidden" {...register("application_id")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Application Date</label>
              <div className="text-sm font-semibold text-gray-900">
                {watch("application_date") && dayjs(watch("application_date")).format("MMM D, YYYY")}
              </div>
              <input type="hidden" {...register("application_date")} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Account No.</label>
              <div className="text-sm font-semibold text-gray-900">{watch("account_number")}</div>
              <input type="hidden" {...register("account_number")} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Applicant Name</label>
              <div className="text-sm font-bold text-gray-900">{watch("applicant_name")}</div>
              <input type="hidden" {...register("applicant_name")} />
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
                {watch("loan_product") || "N/A"}
              </div>
              {errors.loan_product && (<p className="text-error text-xs mt-1">Required</p>)}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
              <div className="text-sm font-semibold text-gray-900 px-3 py-2 bg-gray-50 rounded border border-gray-200">
                {watch("term_months") ? `${watch("term_months")} months` : "N/A"}
              </div>
              {errors.term_months && (<p className="text-error text-xs mt-1">Required</p>)}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount Requested</label>
              <div className="px-4 py-1 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="text-lg font-bold text-blue-900">
                  ₱{watch("amount") ? parseFloat(watch("amount")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </div>
              </div>
              <input
                type="hidden"
                {...register("amount", {required: true, min: selectedProduct?.min_amount || 0, max: selectedProduct?.max_amount || 9999999,})}
              />
              {errors.amount && (<p className="text-error text-xs mt-1">Invalid amount range</p>)}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-2 mt-2">Loan Purpose</label>
            <div className="text-sm text-gray-900 leading-relaxed px-3 py-2.5 bg-gray-50 rounded border border-gray-200">
              {watch("purpose") || "No purpose provided"}
            </div>
            <textarea {...register("purpose", { required: true })} className="hidden" />
            {errors.purpose && (<p className="text-error text-xs mt-1">Required</p>)}
            </div>
          </div>
      </BoardFormModal>

      <LoanAccModal
        title={"Loan Account (Approval)"}
        open={showLoanAccModal}
        close={() => {
          // Go back to edit modal
          const row = loanDataRaw.find((item) => item.application_id === selectedApplicationId);
          if (row) {openEditModal(row);}
          setShowLoanAccModal(false);
        }}
        status={isCalculating}
        onSubmit={handleSubmitLoanAcc(onSubmitLoanAcc)}
      >
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
                  ₱{watch("amount") ? parseFloat(watch("amount")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </div>
              </div>
              <input type="hidden" {...registerLoanAcc("amount_req", {required: true})} value={watch("amount")} />
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
                placeholder={watch("amount")}
                className="input input-bordered w-full border-green-400 focus:border-green-600 font-bold"
              />
              {errorsLoanAcc.principal && (
                <p className="text-error text-xs mt-2">
                  Input amount; must be between ₱{selectedProduct?.min_amount?.toLocaleString()} - ₱{selectedProduct?.max_amount?.toLocaleString()}
                </p>
              )}
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
              defaultValue={dayjs().add(1, 'month').format('YYYY-MM-DD')}
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
            <div className="text-sm font-semibold text-gray-900">{watch("account_number")}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Applicant</label>
            <div className="text-sm font-bold text-gray-900">{watch("applicant_name")}</div>
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
      </LoanAccModal>
      </div>
    </div>
  );
}

export default LoanApplications;


