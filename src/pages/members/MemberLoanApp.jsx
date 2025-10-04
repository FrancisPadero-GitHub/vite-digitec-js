import { useState } from "react";
import { useForm } from "react-hook-form";

// custom hooks
import { useFetchLoanProducts } from "./hooks/useFetchLoanProduct";
import { useFetchLoanApp } from "./hooks/useFetchLoanApp";
import { useAddLoanApp } from "./hooks/useAddLoanApp";
import { useEditLoanApp } from "./hooks/useEditLoanApp";
import { useDelete } from "../treasurer/hooks/useDelete";

// components
import MembersFormModal from "./modal/MembersFormModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { LOAN_APPLICATION_STATUS_COLORS } from "../../constants/Color";

function MemberLoanApp() {
  const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: memberLoanAppData, isLoading, isError, error } = useFetchLoanApp(page, limit);
  const loanDataRaw = memberLoanAppData?.data || [];
  const total = loanDataRaw?.count || 0;

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [termFilter, settermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const TABLE_PREFIX = "APP_";

  const memberLoanApplications = loanDataRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}${row.application_id}`;

    const matchesSearch =
      searchTerm === "" ||
      row.amount?.toString().includes(searchTerm) ||
      row.term_months?.toString().includes(searchTerm) ||
      row.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = termFilter === "" || row.term_months.toString() === termFilter;
   
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

  const [isEditable, setIsEditable] = useState(true);
  const [modalType, setModalType] = useState(null);

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
      loan_product: "",
      amount: "",
      purpose: "",
      term_months: "",
      application_date: today,
    },
  });

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = loanProducts?.find((p) => p.name === selectedLoanProduct);

  // Modal Handlers
  const openAddModal = () => {
    reset({
      application_id: null,
      loan_product: "",
      amount: "",
      purpose: "",
      term_months: "",
      application_date: today,
    });
    setIsEditable(true);
    setModalType("add");
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
      term_months: row.term_months || "",
      application_date: row.application_date || today,
      status: row.status || "Pending",
    });

    setIsEditable(row.status === "Pending");
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
    const selectedProduct = loanProducts?.find(
      (product) => product.name === data.loan_product
    );

    const payload = {
      ...data,
      product_id: selectedProduct?.product_id || null,
    };

    if (modalType === "add") mutateAdd(payload);
    else mutateEdit(payload);

    closeModal();
  };

  if (isLoading) return <div>Loading Member Loan...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
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
              label: "Term",
              value: termFilter,
              onChange: settermFilter,
              options: [
                { label: "All", value: "" },
                { label: "6 months", value: "6"},
                { label: "12 months", value: "12" },
                { label: "24 months", value: "24" },
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
            "Loan Product",
            "Amount",
            "Purpose",
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
                <td>{matchedLoanProduct?.name || "Not Found"}</td>
                <td className="font-semibold text-success">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
                <td>{row.purpose}</td>
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
          status={!isEditable}
          deleteAction={() =>
            handleDelete(watch("application_id"))
          }
        >
          {/* Form Fields */}
          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Loan Product
              </span>
            </label>
            <select
              {...register("loan_product", { required: true })}
              disabled={!isEditable}
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
              disabled={!isEditable || !selectedLoanProduct}
              placeholder={
                selectedProduct
                  ? `Enter between ${selectedProduct.min_amount} - ${selectedProduct.max_amount}`
                  : "Select a loan product first"
              }
              className={`input input-bordered w-full ${!selectedLoanProduct ? "text-warning" : ""
                }`}
            />
            {errors.amount && (
              <p className="text-error text-sm mt-1">
                Invalid amount range
              </p>
            )}
          </div>

          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Term</span>
            </label>
            <select
              {...register("term_months", { required: true })}
              disabled={!isEditable}
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

          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                Application Date
              </span>
            </label>
            <input
              type="date"
              {...register("application_date", { required: true })}
              disabled={!isEditable}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full mt-2">
            <label className="label mb-1">
              <span className="label-text font-medium text-gray-700">Purpose</span>
            </label>
            <textarea
              {...register("purpose", { required: true })}
              disabled={!isEditable}
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

export default MemberLoanApp;
