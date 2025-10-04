import { useState } from "react";
import { useForm } from "react-hook-form";

// custom hooks
import { useFetchLoanProducts } from "../members/hooks/useFetchLoanProduct";
import { useFetchLoanApp } from "./hooks/useFetchLoanApps";
import { useEditLoanApp } from "./hooks/useEditLoanApp";
import { useMembers } from "../../backend/hooks/useFetchMembers";
import { useDelete } from "../treasurer/hooks/useDelete";


// components
import MembersFormModal from "../members/modal/MembersFormModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants


function LoanApplications() {
   const { data: members } = useMembers();
  const { data: loanProducts } = useFetchLoanProducts();

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
  const TABLE_PREFIX = "LA_";

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
  const { mutate: mutateDelete } = useDelete();


  const [modalType, setModalType] = useState(null);
  const STATUS_OPTIONS = ["Pending", "On Review", "Approved", "Denied"];
  const today = new Date().toISOString().split("T")[0];

  // React Hook Form setup
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

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct);

  const openEditModal = (row) => {

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
      applicant_name: fullName,
      loan_product: matchedProduct?.name || "",
      amount: row.amount || "",
      purpose: row.purpose || "",
      term_months: row.term_months || "",
      application_date: row.application_date || today,
      status: row.status,
    });

    
    setModalType("edit");
  };

  const closeModal = () => setModalType(null);

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

    mutateEdit(data);

    closeModal();
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
              (product_id) => product_id.product_id === row.product_id
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
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() => handleDelete(watch("application_id"))}
      > 
        {/* Ref No. */}
        <div className="form-control w-full mt-2">
          <label className="label mb-1">
            <span className="label-text font-medium text-gray-700">Ref No.</span>
          </label>
          <input
            value={`LA_${watch("application_id") || ""}`}
            // {...register("application_id")}
            readOnly
            className="input input-bordered w-full bg-gray-100 text-gray-700"
          />
        </div>

        {/* Loan Status */}
        <div className="form-control w-full mt-2">
          <label className="label mb-1">
            <span className="label-text font-medium text-gray-700">
              Application Status
            </span>
          </label>
          <select
            {...register("status", { required: true })}
            className="select select-bordered w-full"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
            
          </select>

          {errors.status && (
            <p className="text-error text-sm mt-1">Required</p>
          )}
        </div>

        

        {/* Matched Member Section */}
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
            disabled={!selectedLoanProduct}
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
            className="select select-bordered w-full "
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

        {/* Purpose */}
        <div className="form-control w-full mt-2">
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
      </MembersFormModal>

      </div>
    </div>
  );
}

export default LoanApplications;
