import { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast"

// fetch hooks
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanApp } from "../../backend/hooks/shared/useFetchLoanApp";
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";

// mutation hooks
import { useAddLoanApp } from "../../backend/hooks/member/useAddLoanApp";
import { useEditLoanApp } from "../../backend/hooks/member/useEditLoanApp";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import MembersFormModal from "./modal/MembersFormModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// component hook
import { usePrompt } from "../shared/components/usePrompt";

// constants
import { LOAN_APPLICATION_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";


// Restriction
import useLoanRestriction from "../../backend/hooks/member/utils/useRestriction";

/**
 * if loanAppsNo is more than 2 pending and active (ONLY DISABLES BUTTON)
 * if loanAccFind returns true  (ONLY DISABLES BUTTON) 
 * 
 * if tenure is under 1 year                (DISABLES ACCESS TO UI)
 * if age is under 18 years                 (DISABLES ACCESS TO UI)
 * if myShares is less than or equals 5000  (DISABLES ACCESS TO UI)
 * 
 * PS: TO CONFIGURE THIS PAGE THIS CONDITIONS MUST BE MET FIRST
 */

function MemberLoanApp() {
  // const navigate = useNavigate();
  const { hasRestriction } = useLoanRestriction();
  const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: memberLoanAppRaw, isLoading, isError, error } = useFetchLoanApp({ page, limit, useLoggedInMember: true});
  const loanAppRaw = memberLoanAppRaw?.data || [];


  const { showPrompt } = usePrompt();

  const total = loanAppRaw?.count || 0;

  const { data: loanAccRaw } = useFetchLoanAcc({ page, limit, useLoggedInMember: true });
  const loanAcc = loanAccRaw?.data || [];

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const TABLE_PREFIX = "LAPP_";

  const mergedLoanAccounts = loanAppRaw.map(baseRow => {
    const viewRow = loanProducts?.find(v => v.product_id === baseRow.product_id);

    return {
      ...baseRow,
      ...viewRow,
    };
  });

  // console.log(`Test`, mergedLoanAccounts )

  const memberLoanApplications = mergedLoanAccounts.filter((row) => {
    const generatedId = `${TABLE_PREFIX}${row.application_id}`;

    const matchesSearch =
      searchTerm === "" ||
      row.amount?.toString().includes(searchTerm) ||
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const { mutate: mutateAdd, isPending: isAddPending } = useAddLoanApp();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditLoanApp();
  const { mutate: mutateDelete } = useDelete();


  const [modalType, setModalType] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const defaultValues = {
    application_id: null,
    /** loan_product 
     * This does not exists in DB but used for the modal to show the name of the loan product
     * also used to find the name that matches it to assign the product_id
     *   */
    loan_product: "",
    amount: "",
    purpose: "",
    term_months: "",
    status: "",
    application_date: today,
  }

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues
  });

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct); // fetches the loan product info base on the selectedProduct

    /**
     * Grab the application_id in loan application then checks it if it exists on loan accounts
     * used to conditionally render disabled inputs and selects and status on form modal
     */
  const [loanStatus, setLoanStatus] = useState(false);

  // Modal Handlers

  const openAddModal = () => {
    // Count restrictions for loan applications and accounts
    const pendingAppsCount = loanAppRaw.filter(
      (app) => app.status === "Pending"
    ).length;

    const activeLoansCount = loanAcc?.filter(
      (loan) => loan.status === "Active"
    ).length || 0;

    const defaultedLoansCount = loanAcc?.filter(
      (loan) => loan.status === "Defaulted"
    ).length || 0;

    // Restriction parameters
    if (pendingAppsCount >= 2) {
      showPrompt("info", `You have reached the maximum limit of 2 pending applications (${pendingAppsCount}/2)`)
    } else if (activeLoansCount >= 2) {
      showPrompt("info", `You have reached the maximum limit of 2 active loans (${activeLoansCount}/2)`)
    } else if (defaultedLoansCount > 0) {
      showPrompt("info", "Please settle your defaulted loans first")
      // navigate("/regular-member/coop-loans/loan-accounts")
    } else {
      reset(defaultValues);
      setModalType("add");
    }
  };

  const openEditModal = (row) => {
    const matchedProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );
    reset({
      application_id: row.application_id,
      loan_product: matchedProduct?.name || "",
      amount: row.amount || "",
      purpose: row.purpose || "",
      term_months: row.term_months || matchedProduct?.max_term_months || "",
      application_date: row.application_date || today,
      status: row.status || "Pending",
    });

    // returns true or false if the application has already approved and existing in loan accounts
    // setLoanStatus(loanAcc?.some(
    //   (loan) => loan.application_id === watch("application_id")))     
    
    // to disable the form if the app is already Denied not being able to update or delete
    // setLoanStatus(row.status === "Denied" || row.status === "Approved")

    const appFound = loanAcc?.some((loan) => loan.application_id === watch("application_id"))
    
    // Disable editing if status is not pending/if it exists in loan accounts
    if (row.status !== "Pending" || appFound) {setLoanStatus(true);}

    setModalType("edit");
  };

  const closeModal = () => {
    setLoanStatus(false);
    setModalType(null)
  };

  // Delete handler
  const handleDelete = (application_id) => {
    mutateDelete({
      table: "loan_applications",
      column_name: "application_id",
      id: Number(application_id),
    });
    closeModal();
  };

  // Submit handler (add/edit)
  const onSubmit = (data) => {
    if (isAddPending || isEditPending) {
      return;
    }

    /**
     * Matches the name of the data.loan_product TO THE NAME of the product.name 
     * this is very inefficient in so many ways
     * 
     * Might do a fix later but this one will do for now
     */
    const selectedProduct = loanProducts?.find(
      (product) => product.name === data.loan_product
    );
    // custom payload because of this shit above lol
    const payload = {
      ...data,
      product_id: selectedProduct?.product_id || null,
    };

    if (modalType === "add") {
      
      mutateAdd(payload, {
        onSuccess: () => {
          console.log("Front-end data", payload )
          toast.success("Submitted loan application successfully!")
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong!")
        }
      })
    } else {
      mutateEdit(payload, {
        onSuccess: () => {
          toast.success("Updated loan application successfully!")
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong!")
        }
      })
    };


  };

  const fields = [
    {
      label: "Loan Product",
      name: "loan_product",
      type: "select",
      required: true,
      dynamicOptions: loanProducts?.map((p) => ({
        label: p.name,
        value: p.name,
      })) || [],
    },
    {
      label: "Amount",
      name: "amount",
      type: "number",
      required: true,
      disabled: loanStatus || !selectedLoanProduct,
      placeholder: selectedProduct
        ? `Enter between ₱${selectedProduct.min_amount} - ₱${selectedProduct.max_amount}`
        : "Select a loan product first",
      validation: {
        min: selectedProduct?.min_amount || 0,
        max: selectedProduct?.max_amount || 9999999,
      },
    },
    {
      label: "Term",
      name: "term_months",
      type: "select",
      required: true,
      dynamicOptions: selectedProduct
        ? [{ label: `${selectedProduct.max_term_months} months`, value: selectedProduct.max_term_months }]
        : [],
    },
    // Only include application date if modalType is edit
    ...(modalType === "edit" ? [{
      label: "Application Date",
      name: "application_date",
      type: "date",
      required: true,
    },
    ] : []),
    {
      label: "Purpose",
      name: "purpose",
      type: "textarea",
      required: true,
      placeholder: "Enter a very persuasive reason...",
    },
  ];
  
  // sets the value of the term_months if a loan product is selected
  useEffect(() => {
    if (selectedProduct) {
      setValue("term_months", selectedProduct.max_term_months, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("term_months", "");
    }
  }, [selectedProduct, setValue]);


  if (hasRestriction) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-semibold text-red-600">
          You are not eligible for loan applications
        </h2>
        <p className="text-gray-700 mt-2">
          Please contact the administrator or board members for assistance.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="bottom-left"/>
      <div className="mb-6 space-y-4">
        {/* Put a restriction here if a certain criteria is not met */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">My Loan Applications</h1>
          <button
            className="btn btn-neutral"
            onClick={openAddModal}
            aria-label="Apply for loan"
          >
            Apply For A Loan
          </button>
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
                { label: "Pending", value: "Pending"},
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
            const matchedLoanProduct = loanProducts?.find(
              (product_id) => product_id.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;
            const loanTerm = matchedLoanProduct?.max_term_months.toLocaleString();
            return (
              <tr
                key={`${TABLE_PREFIX}${row.application_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openEditModal(row)}
              >
                <td className="text-center text-xs px-2 py-2">{TABLE_PREFIX}{row.application_id?.toLocaleString() || "ID"}</td>
                <td className="px-4 py-2 text-center">
                  {loanProductName ? (
                    <span className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}>
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="font-semibold text-error">Not Provided</span>
                  )}
                </td>
                <td className="font-semibold text-success text-center">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
      
                <td className="text-center">{loanTerm  || "Not Found"} Months</td>
                <td className="text-center">
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
        <MembersFormModal
          title={"Loan Application"}
          open={modalType !== null}
          close={closeModal}
          status={loanStatus}
          action={modalType === "edit"}
          onSubmit={handleSubmit(onSubmit)}
          isPending={isAddPending || isEditPending}
          deleteAction={() => handleDelete(watch("application_id"))}
        >
          {fields.map((field) => {
            // Loan Product
            if (field.name === "loan_product") {
              return (
                <div key={field.name} className="bg-base-100 p-3 rounded-lg border-2 border-gray-200 mb-3">
                  <div className="form-control w-full">
                    <label className="label text-xs font-medium text-base-content/70 mb-1">{field.label}</label>
                    {loanStatus ? (
                      <div className="input input-bordered w-full bg-base-100 flex items-center">
                        {field.dynamicOptions?.find(opt => opt.value === watch(field.name))?.label || 'Select Loan Product'}
                      </div>
                    ) : (
                      <select {...register(field.name, { required: field.required })} className="select select-bordered w-full">
                        <option value="">Select Loan Product</option>
                        {field.dynamicOptions?.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                    )}
                    {errors[field.name] && (<p className="text-error text-xs mt-1">Please select a loan product</p>)}
                  </div>

                  {/* Show loan product terms (interest, penalty, service, loan range) when selected */}
                  {selectedProduct && (
                    <div className="mt-3 p-3 bg-base-100 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-semibold text-base-content/70 mb-2">Loan Terms & Conditions</h5>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Interest Rate:</span>
                          <span className="font-semibold text-blue-700">{selectedProduct.interest_rate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Interest Method:</span>
                          <span className="font-semibold">{selectedProduct.interest_method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Penalty Rate:</span>
                          <span className="font-semibold text-red-500">{selectedProduct.penalty_rate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Repayment Frequency:</span>
                          <span className="font-semibold">{selectedProduct.repayment_freq}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Service Fee:</span>
                          <span className="font-semibold text-purple-700">{selectedProduct.service_fee}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base-content/70">Loan Range:</span>
                          <span className="font-bold text-green-700">₱{selectedProduct.min_amount?.toLocaleString()} - ₱{selectedProduct.max_amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Application details (amount, term, date)
            if (field.name === "amount") {
              const hasAmount = watch("amount");
              const termField = fields?.find(f => f.name === "term_months");
              const dateField = fields?.find(f => f.name === "application_date");
              
              return (
                <div key="application-details" className="bg-base-100 p-3 rounded-lg border border-gray-200 mb-3">
                  {/* Amount */}
                  <div className="mb-3">
                    <label className="label text-xs font-medium text-base-content/70 mb-1">{field.label} Requested</label>
                    {loanStatus ? (
                      <div className="input input-bordered w-full bg-base-100 flex items-center">₱{Number(watch("amount")).toLocaleString()}</div>
                    ) : (
                      <input
                        type="number"
                        {...register(field.name, {
                          required: field.required,
                          min: field.validation?.min,
                          max: field.validation?.max,
                        })}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                        className={`input input-bordered w-full transition-all duration-200 ${
                          hasAmount ? "font-bold text-xl" : "text-sm"
                        } ${
                          field.disabled 
                            ? "bg-base-100" : errors[field.name] ? "border-red-400" : hasAmount ? "border-green-400" : "border-gray-300"
                        }`}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="text-error text-xs mt-1">
                        Amount must be between ₱{selectedProduct?.min_amount?.toLocaleString()} - ₱{selectedProduct?.max_amount?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Term and Date Grid */}
                  <div className={`grid grid-cols-1 gap-3 ${dateField && modalType === "edit" ? "md:grid-cols-2" : ""}`}>
                    {termField && (
                      <div>
                        <label className="label text-xs font-medium text-base-content/70 mb-1">Term (Months)</label>
                        {loanStatus ? (
                          <div className="input input-bordered w-full bg-base-100 flex items-center">
                            {termField.dynamicOptions?.find(opt => opt.value === watch(termField.name))?.label || "—"}
                          </div>
                        ) : (
                          <select
                            {...register(termField.name, { required: termField.required })}
                            disabled={!selectedLoanProduct}
                            className="select select-bordered w-full"
                          >
                            <option value="">Select Term</option>
                            {termField.dynamicOptions?.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                          </select>
                        )}
                        {errors[termField.name] && (<p className="text-error text-xs mt-1">Required</p>)}
                      </div>
                    )}

                    {/* Application Date (when modal is in edit mode) */}
                    {dateField && modalType === "edit" && (
                      <div>
                        <label className="label text-xs font-medium text-base-content/70 mb-1">{dateField.label}</label>
                        <div className="input input-bordered w-full bg-base-100 flex items-center">
                          {watch(dateField.name) ? new Date(watch(dateField.name)).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (field.name === "purpose") {
              return (
                <div key={field.name} className="bg-base-100 p-3 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-semibold text-base-content/70 mb-2">Loan Purpose</h4>
                  <textarea
                    {...register(field.name, { required: field.required })}
                    readOnly={loanStatus}
                    rows={3}
                    placeholder={field.placeholder}
                    className={`textarea textarea-bordered w-full ${loanStatus ? "bg-base-100" : ""}`}
                  />
                  {errors[field.name] && (<p className="text-error text-xs mt-1">Please provide a purpose for this loan</p>)}
                </div>
              );
            }
            return null;
          })}
        </MembersFormModal>
      </div>
    </div>
  );
}

export default MemberLoanApp;
