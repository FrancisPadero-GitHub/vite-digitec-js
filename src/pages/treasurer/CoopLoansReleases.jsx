import {useState} from 'react'
import { useForm } from 'react-hook-form';
import { Toaster, toast} from "react-hot-toast";
// import { useNavigate } from 'react-router-dom';

// fetch hooks
import { useFetchLoanAcc } from '../../backend/hooks/shared/useFetchLoanAcc';
import { useFetchLoanAccView } from '../../backend/hooks/shared/useFetchLoanAccView';
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// mutation hooks
import { useEditLoanAcc } from '../../backend/hooks/treasurer/useEditLoanAcc';

// components
import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';
import BoardFormModal from '../board/modal/BoardFormModal';

// colors
import { LOAN_APPLICATION_STATUS_COLORS, LOAN_PRODUCT_COLORS } from '../../constants/Color';
const catGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTVsM3VoOHU1YWpqMjM0ajJ3bTBsODVxbnJsZDIzdTRyajBrazZ0MyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/qZgHBlenHa1zKqy6Zn/giphy.gif"


function CoopLoansReleases() {
  const {mutate: releaseLoan, isPending } = useEditLoanAcc();

  //  const navigate = useNavigate();
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
   const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  
    // get the outstanding balance on this view table instead of the base table 
  const { data: loanAccView } = useFetchLoanAccView({page, limit});
  const loanAccViewRaw = loanAccView?.data || [];

  const { data: loanAcc, isLoading, isError, error } = useFetchLoanAcc({ page, limit });
  const loanAccRaw = loanAcc?.data || [];
  const total = loanAccRaw?.count || 0;


  // Merge view and base table by loan_id
  const mergedLoanAccounts = loanAccRaw.map(baseRow => {
    const viewRow = loanAccViewRaw.find(v => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow, // all base table fields
      ...viewRow,
    };
  });

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const TABLE_PREFIX = "LACC_";

  const memberLoanAccounts = mergedLoanAccounts.filter((row) => {

    const member = members?.find((m) => m.account_number === row.account_number);
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
  const defaultValues = {
    loan_id: "",
    loan_ref_number: "",
    application_id: "",
    applicant_name: "",
    account_number: "",
    principal: "",
    outstanding_balance: "",
    total_interest: "",
    total_amount_due: "",
    interest_rate: "",
    interest_method: "",
    loan_term: "",
    status: "Active",
    release_date: "",
    maturity_date: "",
    first_due: "",
  };

  // React Hook Form setup for Loan Accounts
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

  const openModal = (row) => {
    // console.log(row)
    setModalType("edit");
    const matchedMember = members?.find(
      (member) => member.account_number === row.account_number
    );
    const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";

    const matchedLoanProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );
    const loanTerm = Number(matchedLoanProduct?.max_term_months) || 0;
    const interestMethod = matchedLoanProduct?.interest_method ?? "";
    const interestRate = Number(matchedLoanProduct?.interest_rate) || 0;

    // This might confuse you but all this modal will update is the release_date column just refer to the hook
    reset({
      ...row,
      applicant_name: fullName,
      loan_term: loanTerm,
      interest_rate: interestRate,
      interest_method: interestMethod,
    });
  };

  const onSubmit = (data) => {
    releaseLoan(data, {
      onSuccess: () => {
        toast.success("Loan released succesfully!")
        closeModal();
      },
      onError: () => {
        toast.error("Something went wrong!")
      }
    })
  };

  const closeModal = () => {
    setModalType(null)
  }


  return (
    <div>
      <Toaster position="bottom-left" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Loan Accounts</h1>
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
                { label: "Active", value: "Active" },
                { label: "Defaulted", value: "Defaulted" },
                { label: "Renewed", value: "Renewed" },
              ],
            },
          ]}
        />

        <MainDataTable
          headers={[
            "Loan Ref No.",
            "Account No.",
            "Name",
            "Principal",
            "Interest",
            "Amount Due",
            "Loan Type",
            "Status",
            "Release"
          ]}
          data={memberLoanAccounts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number
            );

            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );

            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";
            const loanProductName = matchedLoanProduct?.name;

            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openModal(row)}
              >
                {/* Application ID */}
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {TABLE_PREFIX}{row.loan_ref_number?.toLocaleString() || "ID"}
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
                          src={
                            matchedMember?.avatar_url || catGif
                          }
                          alt={fullName}
                        />
                      </div>
                    </div>
                    <div className="truncate">{fullName || <span className="text-gray-400 italic">Not Provided</span>}</div>
                  </span>
                </td>



                {/* Principal*/}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.principal?.toLocaleString() || "0"}
                </td>

                {/* Total Interest */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.total_interest?.toLocaleString() || "0"}
                </td>


                {/*  Total amount due */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.total_amount_due?.toLocaleString() || "0"}
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
          status={true} // disables if the value is null
          isPending={isPending}
          isDisabled={watch("status") === "Active"}
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loan Ref No */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Loan Ref No.
              </label>
              <input
                type="text"
                disabled
                value={watch("loan_ref_number")}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Account No.
              </label>
              <input
                type="text"
                disabled
                {...register("account_number")}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={watch("applicant_name")}
                readOnly
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
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
                className="w-full rounded-md border border-gray-300 bg-gray-100  p-2"
              />
              {errors.principal && (
                <p className="text-red-500 text-sm mt-1">Principal is required</p>
              )}
            </div>

            {/* Total Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Total Interest
              </label>
              <input
                type="number"
                disabled
                {...register("total_interest", { required: true })}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
              {errors.total_interest && (
                <p className="text-red-500 text-sm mt-1">Total interest rate is required</p>
              )}
            </div>

            {/* Amount Due */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Amount Due
              </label>
              <input
                type="number"
                disabled
                {...register("total_amount_due", { required: true })}
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
              {errors.total_amount_due && (
                <p className="text-red-500 text-sm mt-1">Amount due is required</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <input
                value={watch("status")}
                disabled
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>

            {/* First Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                First Due Date
              </label>
              <input
                type="date"
                {...register("first_due", { required: true })}
                className="w-full rounded-md border border-gray-300 p-2"
              />
              {errors.first_due && (
                <p className="text-red-500 text-sm mt-1">
                  First due date is required
                </p>
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

            
          </div>
          {/* Button below the grid */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setValue("release_date", new Date().toISOString().split("T")[0])}
              disabled={!!watch("release_date")}
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

export default CoopLoansReleases
