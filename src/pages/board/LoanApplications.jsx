import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

// custom hooks
import { useFetchLoanProducts } from "../members/hooks/useFetchLoanProduct";

import { useFetchLoanApp } from "./hooks/useFetchLoanApps";
import { useEditLoanApp } from "./hooks/useEditLoanApp";

import { useMembers } from "../../backend/hooks/useFetchMembers";

import { useFetchLoanAcc } from "./hooks/useFetchLoanAcc";
import { useAddLoanAcc } from "./hooks/useAddLoanAcc";

import { useDelete } from "../treasurer/hooks/useDelete";

// components
import MembersFormModal from "../members/modal/MembersFormModal";
import LoanAccModal from "./modal/LoanAccModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants

function LoanApplications() {
  const navigate = useNavigate();
  const { data: members } = useMembers();
  const { data: loanAccRaw} = useFetchLoanAcc();
  const loanAcc = loanAccRaw?.data || [];
  
  const { data: loanProducts } = useFetchLoanProducts();
  const { mutate: addLoanApp } = useAddLoanAcc();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: memberLoanAppData, isLoading, isError, error } = useFetchLoanApp(page, limit);
  const loanDataRaw = memberLoanAppData?.data || [];
  const total = loanDataRaw?.count || 0;

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const TABLE_PREFIX = "LAPP_";

  const memberLoanApplications = loanDataRaw.filter((row) => {

    const member = members?.find((m) => m.member_id === row.applicant_id);
    const fullName = member
      ? `${member.f_name} ${member.l_name} ${member.email}`.toLowerCase()
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

  // React Hook Form setup for loan applications 
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      application_id: null,
      applicant_name: null,
      loan_product: "",
      amount: "",
      purpose: "",
      term_months: "",
      application_date: today,
      status: "",
    },
  });

  // React Hook Form setup for Loan Accounts
  const {
    register: registerLoanAcc,
    handleSubmit: handleSubmitLoanAcc,
    reset: resetLoanAcc,
    watch: watchLoanAcc,
    formState: { errors: errorsLoanAcc },
  } = useForm({
    defaultValues: {
      loan_id: null,
      application_id: null,
      applicant_id: null,
      product_id: null,
      account_number: "",
      principal: "",
      outstanding_balance: "",
      interest_rate: "",
      interest_method: "",
      status: "Active",
      release_date: null, // will be configured by treasurer
      maturity_date: "",
    },
  });

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct);

  /**
   * Grab the application_id in loan application then checks it if it exists on loan accounts
   * used to conditionally render disabled inputs and selects and status on form modal
   */
  const [loanStatus, setLoanStatus] = useState(false);
  
  const openEditModal = (row) => {
    // console.log("eid", row.product_id)
    
    const matchedMember = members?.find(
      (member) => member.member_id === row.applicant_id
    );
    const fullName = matchedMember
      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
      : "";

    const matchedProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );

    reset({
      application_id: row.application_id,
      applicant_id: row.applicant_id,
      applicant_name: fullName,
      loan_product: matchedProduct?.name || "",
      amount: row.amount || "",
      purpose: row.purpose || "",
      term_months: row.term_months || "",
      application_date: row.application_date || today,
      status: row.status,
    });

    setLoanStatus(loanAcc?.some((loan) => loan.application_id === watch("application_id")))

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
  const [pendingAppData, setPendingAppData] = useState(null);


  // Submit handler (add/edit)
  const onSubmit = (data) => {
    const generateAccountNumber = (appId) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const paddedId = String(appId).padStart(6, "0");
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      return `ACCT-${year}${month}${day}-${paddedId}${randomSuffix}`;
    };

    if (data.status === "Approved") {
      const row = loanDataRaw.find(
        (item) => item.application_id === data.application_id
      );

      const matchedProduct = loanProducts?.find(
        (product) => product.product_id === row.product_id
      );

      resetLoanAcc({
        loan_id: null,
        application_id: data.application_id,
        applicant_id: data.applicant_id,
        product_id: matchedProduct?.product_id ?? null,
        account_number: generateAccountNumber(data.application_id),
        principal: data.amount,
        outstanding_balance: data.amount,
        interest_rate: Number(matchedProduct?.interest_rate) || 0,
        interest_method: matchedProduct?.interest_method ?? "",
        status: "Active",
        release_date: null,
        maturity_date: (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 12);
          return date.toISOString().split("T")[0];
        })(),
      });

      // store the application data for later mutation for the edit on loan application
      setPendingAppData(data);

      setSelectedApplicationId(data.application_id);
      setShowLoanAccModal(true);
    } else {
      mutateEdit(data);
      closeModal();
    }
  };


  // Loan Accounts handler
  const onSubmitLoanAcc = (loanAccData) => {
    // 1. Create the loan account
    addLoanApp(loanAccData);

    // 2. Mutate the original application too (if it's pending)
    if (pendingAppData) {
      mutateEdit(pendingAppData);
      setPendingAppData(null); // clear it after use
    }

    // 3. Finalize UI
    setShowLoanAccModal(false);
    closeModal();
    navigate("/board/loan-accounts");
  };



  if (isLoading) return <div>Loading Member Loan...</div>;
  if (isError) return <div>Error: {error.message}</div>;

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
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "All", value: "" },
                { label: "Pending", value: "Pending" },
                { label: "On Review", value: "On Review" },
                { label: "Approved", value: "Approved" },
                { label: "Denied", value: "Denied" },

              ],
            },
            {
              label: "Year",
              value: yearFilter,
              onChange: setYearFilter,
              options: [
                { label: "All", value: "" },
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
              ],
            },
            {
              label: "Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "All", value: "" },
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
            "Name",
            "Loan Product",
            "Amount",
            "Term",
            "Application Date",
            "Status",
          ]}
          data={memberLoanApplications}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.member_id === row.applicant_id
            );

            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );
            return (
              <tr
                key={`${TABLE_PREFIX}${row.application_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openEditModal(row)}
              >
                <td className="text-center">
                  {TABLE_PREFIX}{row.application_id?.toLocaleString() || "ID"}
                </td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2">
                    {matchedMember
                      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                      : "System"}
                  </span>
                </td>
                <td>{matchedLoanProduct?.name || "Not Found"}</td>
                <td className="font-semibold text-success">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
                <td>{row.term_months} Months</td>
                <td>
                  {row.application_date
                    ? new Date(row.application_date).toLocaleDateString()
                    : "Not Provided"}
                </td>
                <td>{row.status}</td>
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
        deleteAction={() => handleDelete(watch("application_id"))}
      >
        {/* Use grid layout for 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ref No. */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Ref No.</span>
            </label>
            <input
              value={`LA_${watch("application_id") || ""}`}
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
              <span className="label-text font-medium text-gray-700">Applicant</span>
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
                <span className="label-text font-medium text-gray-700">Amount</span>
              </label>
              <input
                type="number"
                {...register("amount", {
                  required: true,
                  min: selectedProduct?.min_amount || 0,
                  max: selectedProduct?.max_amount || 9999999,
                })}
                disabled={
                  !selectedLoanProduct || loanStatus
                }
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
      </MembersFormModal>

      <LoanAccModal
        title={"Loan Account"}
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
        action={"add"}
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
              value={`LA_${watchLoanAcc("application_id") || ""}`}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
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
              {...registerLoanAcc("account_number", { required: true })}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.account_number && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Principal */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Principal</span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("principal", { required: true })}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.principal && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>

          {/* Outstanding Balance */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Outstanding Balance
              </span>
            </label>
            <input
              type="number"
              {...registerLoanAcc("outstanding_balance", { required: true })}
              readOnly
              className="input input-bordered w-full bg-gray-100 text-gray-700"
            />
            {errorsLoanAcc.outstanding_balance && (
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
              className="input input-bordered w-full"
            />
            {errorsLoanAcc.interest_rate && (
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
              className="input input-bordered w-full"
            />
            
            {errorsLoanAcc.interest_method && (
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

          {/* Maturity Date */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Maturity Date</span>
            </label>
            <input
              type="date"
              {...registerLoanAcc("maturity_date", { required: false })}
              readOnly
              className="input input-bordered w-full"
            />
            {errorsLoanAcc.maturity_date && (
              <p className="text-error text-sm mt-1">Required</p>
            )}
          </div>
        </div>
      </LoanAccModal>

      </div>
    </div>
  );
}

export default LoanApplications;


