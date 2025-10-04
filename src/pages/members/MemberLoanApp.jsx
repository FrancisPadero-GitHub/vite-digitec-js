import {useState} from "react"

// custom hooks
import { useFetchLoanProducts } from "./hooks/useFetchLoanProduct";
import { useFetchLoanApp } from "./hooks/useFetchLoanApp";
import { useAddLoanApp } from "./hooks/useAddLoanApp"
import { useEditLoanApp } from "./hooks/useEditLoanApp";
import { useDelete } from "../treasurer/hooks/useDelete";

// components
import MembersFormModal from "./modal/MembersFormModal";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { LOAN_APPLICATION_STATUS_COLORS } from "../../constants/Color";

function MemberLoanApp() {
  const {data: loanProducts} = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20); 
  const { data: memberLoanAppData, isLoading, isError, error } = useFetchLoanApp(page, limit);
  const loanDataRaw = memberLoanAppData?.data || []
  const total = loanDataRaw?.count || 0;

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState(""); 
  const [termFilter, settermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const TABLE_PREFIX = "APP_";
  const memberLoanApplications = loanDataRaw.filter((row)=>{
    const generatedId = `${TABLE_PREFIX}_${row.application_id}`;
    
    const matchesSearch =
      searchTerm === "" ||
      row.amount?.toString().includes(searchTerm) ||
      row.term_months?.toString().includes(searchTerm) ||
      row.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus =
      termFilter === "" || row.term === termFilter;

    const date = row.application_date ? new Date(row.application_date) : null;

    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
      
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesStatus && matchesYear && matchesMonth;
  })


  const { mutate: mutateAdd } = useAddLoanApp();
  const { mutate: mutateEdit } = useEditLoanApp();
  const { mutate: mutateDelete } = useDelete();
  
  const [isEditable, setIsEditable] = useState(true);
  const [modalType, setModalType] = useState(null); 

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData]= useState({
    application_id: null,
    loan_product: "",
    amount: "",
    purpose: "",
    term_months: "",
    application_date: today,
  })

  const fields = [
    { label: "Loan Product", name: "loan_product", type: "select" },
    { label: "Amount", name: "amount", type: "number" },
    { label: "Term", name: "term_months", type: "select" },
    { label: "Date", name: "application_date", type: "date" },
    { label: "Purpose", name: "purpose", type: "text" },
  ];


  /**
   * Modal Handlers
   */
  const openAddModal = () => {
    // resets form if it was previously used for editing
    setFormData({
      application_id: null,
      loan_product: "",
      amount: "",
      purpose: "",
      term_months: "",
      application_date: today,

    });
    setModalType("add");
  };

  const openEditModal = (row) => {

    console.log(row)
    const matchedProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );

    setFormData({
      application_id: row.application_id,
      loan_product: matchedProduct?.name || "",
      amount: row.amount || "",
      purpose: row.purpose || "",
      term_months: row.term_months || "",
      application_date: row.application_date || today,
      status: row.status || "Pending",
    });

    // NEW: determine if editing should be disabled
    setIsEditable(row.status === "Pending");

    setModalType("edit");
  };


  const closeModal = () => {
    setModalType(null);
  };

  /**
  * Form Handlers
  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleDelete = (application_id) => {
    mutateDelete({ table: "loan_applications", column_name: "application_id", id: Number(application_id) }); // hard coded base on what file the modal is imported
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedProduct = loanProducts?.find(
      (product) => product.name === formData.loan_product
    );

    const payload = {
      ...formData,
      product_id: selectedProduct?.product_id || null,
    };

    console.log("Payloand",  payload)

    if (modalType === "add") {
      mutateAdd(payload);
      console.log("Adding Loan App:", payload);
    } else if (modalType === "edit") {
      mutateEdit(payload);
      console.log("Updating Loan App:", payload);
    }

    closeModal();
  };


  if (isLoading) return <div>Loading Member Loan...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Loan Applications</h1>
          </div>
          <div className="flex flex-row flex-wrap gap-2">
            {/* <button className="btn btn-outline">Export as CSV</button> */}
            <button
              className="btn btn-neutral"
              onClick={openAddModal}
              aria-label="Apply for loan"
            >
              Apply For A Loan
            </button>
          </div>
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
                { label: "6 months", value: "6 months" },
                { label: "12 months", value: "12 months" },
                { label: "24 months", value: "24 months" },
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
                { label: "2022", value: "2022" },
                { label: "2021", value: "2021" },
                { label: "2020", value: "2020" },
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
          headers={["Ref No.","Loan Product", "Amount", "Purpose", "Term", "Application Date", "Status", ]}
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
              <tr key={`${TABLE_PREFIX}${row.application_id}`} className=" cursor-pointer hover:bg-base-200/50"
                onClick={() => openEditModal(row)}
              >
                <td className="text-center">{TABLE_PREFIX}_{row.application_id?.toLocaleString() || "ID"}</td>
                <td className="text-px-4 py-2">{matchedLoanProduct?.name || "Not Found"}</td>

                <td className="px-4 py-2 font-semibold text-success">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>

                <td className="px-4 py-2">{row.purpose}</td>
                <td className="px-4 py-2">
                  {row.term_months} Months
                </td>
                <td className="px-4 py-2">{row.application_date ? new Date(row.application_date).toLocaleDateString() : "Not Provided"}</td>
                <td className="px-4 py-2">{row.status}</td>
              </tr>
            )}}
        />

        <MembersFormModal 
          title={"Loan Application"}
          open={modalType !== null}
          close={closeModal}
          action={modalType === "edit"}
          onSubmit={handleSubmit}
          status={!isEditable}
          deleteAction={() => handleDelete(formData.application_id)}
        >
          
          {fields.map(({ label, name, type, options }) => (
            <div key={name} className="form-control w-full mt-2">
              <label htmlFor={name} className="label mb-1">
                <span className="label-text font-medium text-gray-700">{label}</span>
              </label>

              {type === "select" ? (
                <select
                  id={name}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  disabled={!isEditable}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="" disabled>
                    Select {label}
                  </option>

                  {/** LOAN PRODUCTS 
                   * Dynamically rendered from db
                   * */ }
                  {name === "loan_product" ? (
                    isLoading ? (
                      <option disabled>Loading loan products...</option>
                    ) : loanProducts && loanProducts.length > 0 ? (
                      loanProducts.map((product) => (
                        <option key={product.product_id} value={product.name}>
                          {product.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No loan products available</option>
                    )
                  ) : name === "term_months" ? (
                    formData.loan_product ? (
                      isLoading ? (
                        <option disabled>Loading terms...</option>
                      ) : (
                        loanProducts
                          .filter((product) => product.name === formData.loan_product)
                          .map((product) => (
                            <option key={product.product_id} value={product.max_term_months}>
                              {product.max_term_months} months
                            </option>
                          ))
                      )
                    ) : (
                      <option disabled>Select a loan product first</option>
                    )
                  ) : (
                    options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))
                  )}

                </select>
              ) : name === "purpose" ? (
                <textarea
                  id={name}
                  name={name}
                  value={formData[name] || ""}
                  disabled={!isEditable}
                  onChange={handleChange}
                  placeholder="Enter a very persuasive reason why we should lend you a loan..."
                  rows={3}
                  className="textarea textarea-bordered w-full"
                />
              ) : (
                <input
                  id={name}
                  type={type}
                  name={name}
                  disabled={!isEditable}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              )}
            </div>
          ))}


        </MembersFormModal>

      </div>
    </div>
  );
}

export default MemberLoanApp
