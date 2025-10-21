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
import { useLoanRestriction } from "../shared/components/useRestriction";

/**
 * if loanAppsNo is more than 1 (ONLY DISABLES BUTTON) 
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

  const memberLoanApplications = loanAppRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}${row.application_id}`;

    const matchesSearch =
      searchTerm === "" ||
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
  const { mutate: mutateAdd } = useAddLoanApp();
  const { mutate: mutateEdit } = useEditLoanApp();
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
    // for the restriction of the button
    const loanAppStatus = loanAppRaw.some(
      (app) => app.status === "Pending"
    ); 
    const loanAccFind = loanAcc?.some(
      (loan) => loan.status === "Active" || loan.status === "Defaulted"
    );

    if (loanAppStatus) {
      showPrompt("info", "You already have pending application")
    } else if (loanAccFind) {
      showPrompt("info", "Please settle your ongoing loans first")
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
      application_date: row.application_date || today,
      status: row.status || "Pending",
    });

    // returns true or false if the application has already approved and existing in loan accounts
    // setLoanStatus(loanAcc?.some(
    //   (loan) => loan.application_id === watch("application_id")))     
    
    // to disable the form if the app is already Denied not being able to update or delete
    // setLoanStatus(row.status === "Denied" || row.status === "Approved")

    const appFound = loanAcc?.some((loan) => loan.application_id === watch("application_id"))
    
    if (row.status === "Denied" || row.status === "Approved" || appFound) setLoanStatus(true)

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
    {
      label: "Application Date",
      name: "application_date",
      type: "date",
      required: true,
    },
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
          deleteAction={() =>
            handleDelete(watch("application_id"))
          }
        >
          {fields.map((field) => (
            <div key={field.name} className="form-control w-full mt-2">
              <label className="label mb-1">
                <span className="label-text font-medium text-gray-700">{field.label}</span>
              </label>
              {field.type === "select" && (
                <select
                  {...register(field.name, { required: field.required })}
                  disabled={field.disabled}
                  className="select select-bordered w-full"
                >
                  {field.dynamicOptions?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "number" && (
                <input
                  type="number"
                  {...register(field.name, {
                    required: field.required,
                    min: field.validation?.min,
                    max: field.validation?.max,
                  })}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  className={`input input-bordered w-full ${!selectedLoanProduct && field.name === "amount" ? "text-warning" : ""
                    }`}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  {...register(field.name, { required: field.required })}
                  readOnly={field.disabled}
                  rows={3}
                  placeholder={field.placeholder}
                  className="textarea textarea-bordered w-full"
                />
              )}
              {field.type === "date" && (
                <input
                    type="date"
                    {...register(field.name, { required: field.required })}
                  readOnly={field.disabled}
                  className="input input-bordered w-full"
                />
              )}
              {errors[field.name] && (
                <p className="text-error text-sm mt-1">
                  {field.name === "amount" ? "Invalid amount range" : "Required"}
                </p>
              )}
            </div>
          ))}
        </MembersFormModal>
      </div>
    </div>
  );
}

export default MemberLoanApp;
