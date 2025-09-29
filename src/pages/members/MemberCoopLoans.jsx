import {useState} from "react"
import { Link } from 'react-router';

// custom hooks
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
import FormModal from "../treasurer/modals/FormModal";

function MemberCoopLoans() {

  // Data fetch and pagination control
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
      row.amount_req?.toString().includes(searchTerm) ||
      row.term?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const { mutate: mutateDelete } = useDelete('loan_applications');

  const [modalType, setModalType] = useState(null); 

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData]= useState({
    application_id: null,
    loan_type: "Regular", // fixed for now cause of the ectec policy
    amount_req: "",
    purpose: "",
    term: "",
    application_date: today,
    remarks: "",
  })

  const fields = [
    { label: "Loan Type", name: "loan_type", type: "text" },
    { label: "Amount", name: "amount_req", type: "number" },
    { label: "Term", name: "term", type: "select", options: ["6 months", "12 months","24 months"] },
    { label: "Date", name: "application_date", type: "date" },
    { label: "Purpose", name: "purpose", type: "text" },
    { label: "Remarks", name: "remarks", type: "text" },
  ]

  /**
   * Modal Handlers
   */
  const openAddModal = () => {
    // resets form if it was previously used for editing
    setFormData({
      application_id: null,
      loan_type: "Regular",
      amount_req: "",
      purpose: "",
      term: "",
      application_date: today,
      remarks: "",
    });
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    setFormData(selectedRowData); // preload form with row data
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
      [name]: name === "amount_req" ? Number(value) : value,
    }));
  };

  const handleDelete = (selectedRowID) => {
    mutateDelete({ table: "loan_applications", column_name: "application_id", id: selectedRowID }); // hard coded base on what file the modal is imported
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === "add") {
      mutateAdd(formData);
      console.log("Adding Loan App:", formData);
    } else if (modalType === "edit") {
      mutateEdit(formData);
      console.log("Updating Loan App:", formData);
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
            <h1 className="text-2xl font-bold">My Coop Loans</h1>
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
          headers={["Ref No.", "Amount Requested", "Purpose", "Term", "Application Date", "Remarks"]}
          data={memberLoanApplications}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => (
            <tr key={`${TABLE_PREFIX}${row.application_id}`} className=" cursor-pointer hover:bg-base-200/50"
              onClick={() => openEditModal(row)}
            >
              <td className="text-center">{TABLE_PREFIX}_{row.application_id?.toLocaleString() || "ID"}</td>
              <td className="px-4 py-2 font-semibold text-success">
                ₱ {row.amount_req?.toLocaleString() || "0"}
              </td>
              <td className="px-4 py-2">{row.purpose}</td>
              <td className="px-4 py-2">
                {row.term}
              </td>
              <td className="px-4 py-2">{row.application_date ? new Date(row.application_date).toLocaleDateString() : "Not Provided"}</td>
              <td className="px-4 py-2">{row.remarks}</td>
            </tr>    
          )}
        />

        <FormModal 
          open={modalType !== null}
          close={closeModal}
          action={modalType === "edit"}
          onSubmit={handleSubmit}
          deleteAction={() => handleDelete(formData.application_id)}
        >
          {fields.map(({ label, name, type, options }) => (
            <div key={name} className="form-control w-full mt-2">
              <label htmlFor={name} className="label mb-1">
                <span className="label-text font-medium text-gray-700">
                  {label}
                </span>
              </label>

              {type === "select" ? (
                <select
                  id={name}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="" className="label" disabled>Select {label}</option>
                  {options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : name === "purpose" ? (
                  <textarea
                    id={name}
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    placeholder="Enter a very persuasive reason why should we lend you a loan..."
                    rows={3}
                    className="textarea textarea-bordered w-full"
                  />
              ) : name === "loan_type" ? (
                  <input
                    id={name}
                    type={type}
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-base-200 text-base-content"
                    readOnly
                  />
              ) : (
                <input
                  id={name}
                  type={type}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              )}
            </div>
          ))}
        </FormModal>

      </div>
    </div>
  );
}

export default MemberCoopLoans
