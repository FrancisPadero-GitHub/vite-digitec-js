import {useState} from 'react'
import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';

import { useFetchLoanAcc } from '../board/hooks/useFetchLoanAcc';
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchLoanProducts } from '../members/hooks/useFetchLoanProduct';
import { useEditLoanAcc } from './hooks/useEditLoanAcc';

import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';
import BoardFormModal from '../board/modal/BoardFormModal';

function LoanAccounts() {
  const {mutate: releaseLoan } = useEditLoanAcc();

  //  const navigate = useNavigate();
   const { data: members } = useMembers();
   const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanApps, isLoading, isError, error } = useFetchLoanAcc(page, limit);
  const loanAppRaw = loanApps?.data || [];
  const total = loanAppRaw?.count || 0;

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const TABLE_PREFIX = "LACC_";

  const memberLoanAccounts = loanAppRaw.filter((row) => {

    const member = members?.find((m) => m.member_id === row.applicant_id);
    const fullName = member
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const [modalType, setModalType] = useState(null);


  // React Hook Form setup for Loan Accounts
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loan_id: null,
      application_id: null,
      applicant_id: null,
      account_number: "",
      principal: null,
      outstanding_balance: null,
      interest_rate: null,
      interest_method: null,
      status: "Active",
      release_date: null, // will be configured by treasurer
      maturity_date: "",
    },
  });

  const openModal = (row) => {
    console.log(row)
    setModalType("edit");
    const matchedLoanProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );
    reset({
      loan_id: row.loan_id,
      application_id: row.application_id,
      applicant_id: row.applicant_id,
      account_number: row.account_number,
      principal: row.principal,
      outstanding_balance: row.outstanding_balance,
      interest_rate: Number(matchedLoanProduct?.interest_rate) || 0,
      interest_method: matchedLoanProduct?.interest_method ?? "",
      status: row.status,
      release_date: row.release_date ?? "",
      maturity_date: row.maturity_date ?? "",
    });
  };

  const onSubmit = (data) => {
    releaseLoan(data)
    closeModal();
  };


  const closeModal = () => {
    setModalType(null)
  }


  

  if (isLoading) return <div>Loading Loan Accounts...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Loan Accounts</h1>
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
                { label: "Active", value: "Active" },
                { label: "Defaulted", value: "Defaulted" },
                { label: "Renewed", value: "Renewed" },
              ],
            },
          ]}
        />

        <MainDataTable
          headers={[
            "Account No.",
            "Name",
            "Principal",
            "Total Amount Due",
            "Loan Type",
            "Interest rate",
            "Method",
            "Term",
            "Maturity Date",
            "Status",
            "Release"
          ]}
          data={memberLoanAccounts}
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
            const loanProductName = matchedLoanProduct?.name;
            const interestRate = matchedLoanProduct?.interest_rate.toLocaleString();
            const interestMethod = matchedLoanProduct?.interest_method;
            const loanTerm = matchedLoanProduct?.max_term_months.toLocaleString();

            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openModal(row)}
              >
                 {/* Account number */}
                <td className="text-center  ">
                  {row.account_number || "ID"}
                </td>
                {/* Member name */}
                <td className="py-2">
                  <span className="flex items-center gap-2">
                    {matchedMember
                      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                      : "System"}
                  </span>
                </td>
                {/* Principal */}
                <td className="font-semibold text-success">
                  ₱ {row.principal?.toLocaleString() || "0"}
                </td>

                {/* Balance */}
                <td className="font-semibold text-success">
                  ₱ {row.outstanding_balance?.toLocaleString() || "0"}
                </td>
                {/* Loan Product */}
                <td>
                  {loanProductName || "Not Found"}
                </td>

                {/* Interest Rate */}
                <td className="font-semibold text-success">
                  {interestRate || "0"} %
                </td>
                {/* Interest Method */}
                <td>{interestMethod || "Not Found"}</td>
                <td>{loanTerm || "Not Found"}</td>

                {/* Maturity Date */}
                <td>
                  {row.maturity_date
                    ? new Date(row.maturity_date).toLocaleDateString()
                    : "Not Found"}
                </td>
                <td>{row.status}</td>

                {/* Release Date */}
                <td>
                  {row.release_date
                    ? new Date(row.release_date).toLocaleDateString()
                    : "Pending release"}
                </td>

              </tr>
            );
          }}
        />
        
        <BoardFormModal
          title={"Loan Account"}
          open={modalType !== null}
          close={closeModal}
          action={modalType === "edit"}
          onSubmit={handleSubmit(onSubmit)}
         
        >
          <div className="space-y-4">
            {/* Application ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Application ID
              </label>
              <input
                type="text"
                disabled
                {...register("application_id")}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Account Number
              </label>
              <input
                type="text"
                disabled
                {...register("account_number")}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="Active">Active</option>
                <option value="Defaulted">Defaulted</option>
                <option value="Renewed">Renewed</option>
              </select>
            </div>

            {/* Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Principal
              </label>
              <input
                type="number"
                disabled
                {...register("principal", { required: true })}
                className="w-full rounded-md border border-gray-300 p-2"
              />
              {errors.principal && (
                <p className="text-red-500 text-sm mt-1">Principal is required</p>
              )}
            </div>
            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Release Date
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  {...register("release_date", { required: true })}
                  disabled
                  className="w-full rounded-md border border-gray-300 p-2"
                />

              </div>
              {errors.release_date && (
                <p className="text-red-500 text-sm mt-1">
                  Release date is required
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setValue("release_date", new Date().toISOString().split("T")[0])}
              disabled={!!watch("release_date")}  // disables if there's already a value
              className={`px-3 py-2 rounded-md transition
                  ${watch("release_date")
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            >
              {watch("release_date") ? "Date Set" : "Set to Today"}
            </button>
          </div>
        </BoardFormModal>
      </div>
    </div>
  )
}

export default LoanAccounts
