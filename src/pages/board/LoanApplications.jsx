import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanApp } from "../../backend/hooks/shared/useFetchLoanApp";
import { useFetchMemberId } from "../../backend/hooks/shared/useFetchMemberId";

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
import Calculation from "../../constants/Calculation";
import { LOAN_APPLICATION_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";



function LoanApplications() {
  const navigate = useNavigate();
  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetches data 
  const {data: auth_member_id} = useFetchMemberId();    // used by the one who reviewed the loan application

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  
  const { data: loan_acc_data } = useFetchLoanAcc({page, limit});
  const loanAcc = loan_acc_data?.data || [];

  const { data: loanProducts } = useFetchLoanProducts();
  const { data: memberLoanAppData, isLoading, isError, error } = useFetchLoanApp({page, limit});

  // Data manipulation 
  const { mutate: addLoanAcc } = useAddLoanAcc();


  const loanDataRaw = memberLoanAppData?.data || [];
  const total = loanDataRaw?.count || 0;

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
  const today = new Date().toISOString().split("T")[0];


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
      loan_term: "", // front_end only
      interest_method: "", // front_end only
      status: "Active",
      release_date: null, // will be configured by treasurer
      approved_date: today,
      maturity_date: "",
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
  const interestRateValue = watchLoanAcc("interest_rate");
  const loanTermValue = watchLoanAcc("loan_term");

  // detect the changes of principal then calculate on the go
  useEffect(() => {
    if (!principalValue || principalValue <= 0) return;

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const { totalPayable } = Calculation({
        interestRate: Number(interestRateValue),
        principal: Number(principalValue),
        termMonths: Number(loanTermValue)
      });

      setLoanAccValue("total_amount_due", totalPayable);
      setIsCalculating(false);
    }, 600); // debounce delay (ms)

    return () => clearTimeout(timer);
  }, [principalValue, interestRateValue, loanTermValue, setLoanAccValue]);

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct);

  /**
   * Grab the application_id in loan application then checks it if it exists on loan accounts
   * used to conditionally render disabled inputs and selects and status on form modal
   */
  const [loanStatus, setLoanStatus] = useState(false);
 



  
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
    console.log(loanAcc?.some((loan) => loan.application_id === selectedRow.application_id))
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
       // get the term months of the specific loan product to calculate the maturity automatically
      const monthsMaturity = Number(matchedLoanProduct?.max_term_months) || null;

      const interestRate = Number(matchedLoanProduct?.interest_rate) || 0;
      const interestMethod = matchedLoanProduct?.interest_method ?? "";
      const loanTerm = Number(matchedLoanProduct?.max_term_months);

      // for the total amount due input auto calculation
      const {
        // totalInterest,
        totalPayable,
        // monthlyPayment,
        // monthlyPrincipal,
        // monthlyInterest
      } = Calculation(interestRate, data.amount, loanTerm);

      // console.log("Loan Term", loanTerm)

      resetLoanAcc({
        ...data,
        loan_id: null,
        product_id: matchedLoanProduct?.product_id ?? null,
        loan_ref_number: generateAccountNumber(data.application_id),
        total_amount_due: totalPayable,
        interest_rate: interestRate,
        interest_method: interestMethod,
        loan_term: loanTerm,
        status: "Active",
        release_date: null,
        approved_date: today,
        maturity_date: (() => {
          const date = new Date();
          // normalize to avoid edge cases like Jan 31 -> Mar 3 (Feb months is kulang)
          const day = date.getDate();
          date.setDate(1);
          date.setMonth(date.getMonth() + monthsMaturity);
          // restore closest possible day of month
          const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          date.setDate(Math.min(day, lastDayOfMonth));
          return date.toISOString().split("T")[0];
        })(),

      });

      // store the application data for later mutation for the edit on loan application
      setPendingAppData(data); // loan_acc data

      setSelectedApplicationId(data.application_id);
      setShowLoanAccModal(true);
    } else {
      mutateEdit(data);
      console.log("EDITED DATA", data )
      closeModal();
    }
  };


  // Loan Accounts handler
  // This is the last one to be submitted if the status is for approval
  const onSubmitLoanAcc = (loanAccData) => {
    // 1. Create the loan account
    addLoanAcc(loanAccData); // this is the first mutation add on success here then 

    // 2. Mutate the original application too (if it's pending)
    if (pendingAppData) {
      mutateEdit(pendingAppData);
      setPendingAppData(null); // clear it after use
    }

    // 3. Finalize UI

    setShowLoanAccModal(false);
    closeModal();
    navigate("/board/coop-loans/loan-accounts");
    // console.log("FINAL DATA", loanAccData )
  };

  return (
    <div>
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
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {TABLE_PREFIX}{row.application_id?.toLocaleString() || "ID"}
                </td>
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {row.account_number || "Not Found"}
                </td>

                <td className="px-4 py-4">
                    <span className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-circle w-10 h-10">
                          <img
                            src={
                              matchedMember.avatar_url || `https://i.pravatar.cc/40?u=${matchedMember.id || matchedMember.l_name}`
                            }
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
                <td className="px-4 py-2 text-center">{loanTerm || "Not Found"} Months</td>
                <td className="px-4 py-2 text-center">
                  {row.application_date
                    ? new Date(row.application_date).toLocaleDateString()
                    : "Not Found"}
                </td>
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
        title={"Loan Application Info"}
        open={modalType !== null}
        close={closeModal}
        status={loanStatus}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() => handleDelete(watch("application_id"))}
        type={watch("status") === "Approved"} // this one will watch the status changes to set either "next" or "submit" status on the form modal
      >
        {/* Use grid layout for 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ref No. */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Ref No.</span>
            </label>
            <input
              value={`${TABLE_PREFIX}${watch("application_id") || ""}`}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
          </div>

          {/* Loan Application Status */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Application Status
              </span>
            </label>
            <select
              {...register("status", { required: true })}
              className="select select-bordered w-full"
              disabled={loanStatus}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Applicant */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Account No.</span>
            </label>
            <input
              type="text"
              {...register("account_number") }
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
          </div>

          {/* Account Name */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Name</span>
            </label>
            <input
              type="text"
              {...register("applicant_name")}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
          </div>

          {/* Loan Product */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Loan Product
              </span>
            </label>
            <select
              {...register("loan_product", { required: true })}
              disabled
              className="select select-bordered w-full"
            >
              <option value="">Select Loan Product</option>
              {loanProducts?.map((product) => (
                <option key={product.product_id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.loan_product && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Amount */}
            <div className="form-control w-full mt-2">
              <label className="label mb-1">
                <span className="label-text font-medium text-gray-700">Amount Requested</span>
              </label>
              <input
                type="number"
                {...register("amount", {
                  required: true,
                  min: selectedProduct?.min_amount || 0,
                  max: selectedProduct?.max_amount || 9999999,
                })}
                // disabled={
                //   !selectedLoanProduct || loanStatus
                // }
                readOnly
                placeholder={
                  selectedProduct
                    ? `Enter between ${selectedProduct.min_amount} - ${selectedProduct.max_amount}`
                    : "Select a loan product first"
                }
                className={`input input-bordered w-full ${!selectedLoanProduct ? "text-warning" : ""
                  }`}
              />
              {errors.amount && (
                <p className="text-error text-sm mt-1">Invalid amount range</p>
              )}
            </div>


          {/* Term */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Term</span>
            </label>
            <select
              {...register("term_months", { required: true })}
              disabled
              className="select select-bordered w-full"
            >
              <option value="">Select Term</option>
              {selectedProduct && (
                <option value={selectedProduct.max_term_months}>
                  {selectedProduct.max_term_months} months
                </option>
              )}
            </select>
            {errors.term_months && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Application Date */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Application Date
              </span>
            </label>
            <input
              type="date"
              {...register("application_date", { required: true })}
              readOnly
              className="input input-bordered w-full"
            />
          </div>

          {/* Purpose (make this span both columns) */}
          <div className="form-control w-full mt-2 md:col-span-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Purpose</span>
            </label>
            <textarea
              {...register("purpose", { required: true })}
              readOnly
              rows={3}
              placeholder="Enter a very persuasive reason..."
              className="textarea textarea-bordered w-full"
            />
            {errors.purpose && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>
        </div>
      </BoardFormModal>

      <LoanAccModal
        title={"Loan Account (Approval)"}
        open={showLoanAccModal}
        close={() => {
          // Go back to edit modal
          const row = loanDataRaw.find(
            (item) => item.application_id === selectedApplicationId
          );
          if (row) {
            openEditModal(row);
          }
          setShowLoanAccModal(false);
        }}
        status={isCalculating}
        onSubmit={handleSubmitLoanAcc(onSubmitLoanAcc)}
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loan ID (hidden or read-only) */}
          <input type="hidden" {...registerLoanAcc("loan_id")} />

          {/* Ref No. */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Ref No.</span>
            </label>
            <input
              value={`${TABLE_PREFIX}${watchLoanAcc("application_id") || ""}`}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
          </div>

            {/* Loan Ref No. */}
            <div className="form-control w-full mt-2">
              <label className="label mb-1">
                <span className="label-text font-medium text-gray-700">
                  Loan Ref No.
                </span>
              </label>
              <input
                type="text"
                {...registerLoanAcc("loan_ref_number")}
                readOnly
                className="input input-bordered w-full bg-gray-100 text-gray-700"
              />
              {errorsLoanAcc.loan_ref_number && (
                <p className="text-error text-sm mt-1">Required</p>
              )}
            </div>


          {/* Account Number */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Account Number
              </span>
            </label>
            <input
              type="text"
              value={watch("account_number")}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.account_number && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Name */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Name
              </span>
            </label>
            <input
              type="text"
              value={watch("applicant_name")}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errors.applicant_name && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Amount Req */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Amount Requested</span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("amount_req", {required: true})}
              value={watch("amount")}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.amount_req && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Principal */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-bold text-green-700 ">Principal | Approval Amount</span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("principal", { required: true })}
              placeholder={watch("amount")}
              className="input input-bordered w-full"
            />
            {errorsLoanAcc.principal && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Interest Rate */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Interest Rate (%)
              </span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("interest_rate", { required: true })}
              readOnly
                className="input input-bordered w-full bg-gray-100"
            />
            {errorsLoanAcc.interest_rate && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Total To Pay */}
          <div className="form-control w-full mt-2 relative">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Total Amount Due
              </span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("total_amount_due", { required: true })}
              readOnly
              className={`input input-bordered w-full bg-gray-100 text-gray-700 ${isCalculating ? "opacity-50" : ""}`}
            />
            {isCalculating && (
              <span className="absolute right-3 top-10 text-primary animate-spin">
                <AiOutlineLoading3Quarters size={20} />
              </span>
            )}
            {errorsLoanAcc.total_amount_due && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>


          {/* Interest Method */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Interest Method
              </span>
            </label>
            <input
              {...registerLoanAcc("interest_method", { required: true })}
              readOnly
                className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            
            {errorsLoanAcc.interest_method && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Maturity Date */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Maturity Date</span>
            </label>
            <input
              type="date"
              {...registerLoanAcc("maturity_date", { required: false })}
              readOnly
                className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.maturity_date && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Status */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Status</span>
            </label>
            <input
              {...registerLoanAcc("status")}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
          </div>
        </div>
      </LoanAccModal>

      </div>
    </div>
  );
}

export default LoanApplications;


