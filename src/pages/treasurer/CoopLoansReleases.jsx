import {useState} from 'react'
import { useForm } from 'react-hook-form';
import { Toaster, toast} from "react-hot-toast";
import dayjs from 'dayjs';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { createPortal } from 'react-dom'; // lets confirmation modal escape parent container (fixes z-index & overlay issues)
import WarningIcon from '@mui/icons-material/Warning';

// fetch hooks
import { useFetchLoanAcc } from '../../backend/hooks/shared/useFetchLoanAcc';
import { useFetchLoanAccView } from '../../backend/hooks/shared/useFetchLoanAccView';
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';
import { useMemberRole } from '../../backend/context/useMemberRole';


// mutation hooks
import { useEditLoanAcc } from '../../backend/hooks/treasurer/useEditLoanAcc';

// components
import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';
import BoardFormModal from '../board/modal/BoardFormModal';

// colors
import { LOAN_ACCOUNT_STATUS_COLORS } from '../../constants/Color';
import defaultAvatar from '../../assets/placeholder-avatar.png';

function CoopLoansReleases() {
  const placeHolderAvatar = defaultAvatar;
  const {mutate: releaseLoan, isPending } = useEditLoanAcc();

  //  const navigate = useNavigate();
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: loanProducts } = useFetchLoanProducts();

  const { memberRole } = useMemberRole();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    loanProductName: "",
  };

  // React Hook Form setup for Loan Accounts
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
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
    const loanProductName = matchedLoanProduct?.name || "N/A";

    // This might confuse you but all this modal will update is the release_date column just refer to the hook
    reset({
      ...row,
      applicant_name: fullName,
      loan_term: loanTerm,
      interest_rate: interestRate,
      interest_method: interestMethod,
      loanProductName: loanProductName,
    });
  };

  const handleConfirmRelease = () => {
    const data = getValues(); // Get form data
    releaseLoan(data, {
      onSuccess: () => {
        toast.success("Loan released successfully!");
        setShowConfirmModal(false);
        closeModal();
      },
      onError: () => {
        toast.error("Something went wrong!");
        setShowConfirmModal(false);
      }
    });
  };

  const onSubmit = () => {
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setModalType(null)
  }


  return (
    <div>
      <Toaster position="bottom-left" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Loan Releases</h1>
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
            "Amount Requested",
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

            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";

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
                            matchedMember?.avatar_url || placeHolderAvatar
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

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span className={`badge badge-soft font-semibold ${LOAN_ACCOUNT_STATUS_COLORS[row.status] || "badge-error"}`}>
                    {row.status || "Not Provided"}
                  </span>
                </td>

                {/* Release Date */}
                <td className="px-4 py-4 text-center">
                  {row.release_date ? new Date(row.release_date).toLocaleDateString(): "—"}
                </td>

              </tr>
            );
          }}
        />
        
        <BoardFormModal
          title={"Loan Account"}
          open={modalType !== null}
          close={closeModal}
          onSubmit={handleSubmit(onSubmit)}
          status={!watch("release_date")}
          isPending={isPending}
          isDisabled={watch("status") === "Active"}
          memberRole={memberRole}
        >
          {/* Release dates */}
          <div className="p-3 bg-white rounded-lg border-2 border-gray-200 mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold mb-2">Loan Release</h3>

               <div className="mb-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold
                  ${watch("status") === "Active" 
                    ? "bg-green-50 border-green-300 text-green-800" 
                    : "bg-yellow-50 border-yellow-300 text-yellow-700"
                  }`}>
                  <span className={watch("status") === "Active" ? "text-green-600" : "text-yellow-500"}>●</span>
                  {watch("status")}
                </div>
                <input type="hidden" value={watch("status")} />
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {watch("status") === "Active" ? "Released On" : "Release Date"}
                </label>
                {watch("status") === "Active" ? (
                  <div className="px-3 py-2 bg-green-50 rounded border border-green-200 flex items-center gap-2">
                    <CheckCircleOutlinedIcon fontSize="small" className="text-green-600" />
                    <div className="text-sm font-semibold text-green-900">
                      {watch("release_date") ? dayjs(watch("release_date")).format('MMM DD, YYYY') : "N/A"}
                    </div>
                  </div>
                ) : (
                  <input
                    type="date"
                    {...register("release_date", { required: true })}
                    className="input input-bordered w-full border-green-400 focus:border-green-600"
                  />
                )}
                {errors.release_date && (<p className="text-error text-xs mt-1">Release date is required</p>)}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setValue("release_date", dayjs().format('YYYY-MM-DD'))}
                  disabled={!!watch("release_date") || watch("status") === "Active"}
                  className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all
                    ${watch("release_date") || watch("status") === "Active"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                    }`}
                >
                  {watch("release_date") ? "✓ Date Set" : "Set to Today"}
                </button>
              </div>
            </div>

            {/* if release date is present and it's not yet active */}
            {watch("release_date") && watch("status") !== "Active" && (
              <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded flex items-center gap-2">
                <CheckCircleOutlinedIcon fontSize="inherit" className="text-green-700 text-[14px]" />
                <span className="text-xs text-green-800 leading-tight">
                  <strong>Ready to release:</strong> Click "Release" to activate this loan and generate the payment schedule.
                </span>
              </div>
            )}

            {/* if release date is not yet set */}
            {!watch("release_date") && watch("status") !== "Active" && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded flex items-start gap-2">
                <span className="text-xs text-amber-800">
                  <strong>Pending:</strong> Set a release date to proceed with loan activation.
                </span>
              </div>
            )}
          </div>

          {/* Account info */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
            <h4 className="text-xs font-bold text-gray-600 mb-2">Account Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Loan Ref No.</label>
                <div className="text-sm font-mono font-bold">{watch("loan_ref_number")}</div>
                <input type="hidden" value={watch("loan_ref_number")} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account No.</label>
                <div className="text-sm font-semibold">{watch("account_number")}</div>
                <input type="hidden" {...register("account_number")} />
              </div>
              
              <div className="md:col-span-1 col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Account Holder</label>
                <div className="text-sm font-bold">{watch("applicant_name")}</div>
              </div>
            </div>
          </div>

          {/* Loan details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-600 mb-2">Loan Details</h4>
              
              {/* Loan Type */}
              <span className="text-xs font-semibold text-gray-700 badge badge-ghost">{watch("loanProductName") || "N/A"}</span>
            </div>

            {/* Principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Principal</label>
                <div className="px-3 py-2 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-semibold">
                    ₱{watch("principal") ? parseFloat(watch("principal")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
                <input type="hidden" {...register("principal", { required: true })} />
                {errors.principal && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>

              {/* Total interest */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Interest</label>
                <div className="px-3 py-2 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-semibold">
                    ₱{watch("total_interest") ? parseFloat(watch("total_interest")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
                <input type="hidden" {...register("total_interest", { required: true })} />
                {errors.total_interest && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>

              {/* Total amount due */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Amount Due</label>
                <div className="px-3 py-2 bg-blue-100 rounded border border-blue-300">
                  <div className="text-sm font-bold">
                    ₱{watch("total_amount_due") ? parseFloat(watch("total_amount_due")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </div>
                </div>
                <input type="hidden" {...register("total_amount_due", { required: true })} />
                {errors.total_amount_due && (<p className="text-error text-xs mt-1">Required</p>)}
              </div>
            </div>
          </div>

          {/* Schedule info */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-600 mb-2">Payment Schedule</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">First Due Date</label>
                {watch("status") === "Active" ? (
                  <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-semibold">
                      {watch("first_due") ? dayjs(watch("first_due")).format('MM/DD/YYYY') : "N/A"}
                    </div>
                  </div>
                ) : (
                  <input
                    type="date"
                    {...register("first_due", { required: true })}
                    className="input input-bordered w-full border-gray-400 focus:border-blue-600 font-semibold"
                  />
                )}
                {errors.first_due && (<p className="text-error text-xs mt-1">First due date is required</p>)}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Maturity Date</label>
                <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900">
                    {watch("maturity_date") ? dayjs(watch("maturity_date")).format('MM/DD/YYYY') : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BoardFormModal>

        {/* Confirmation modal; shows up right before you release loan */}
        {showConfirmModal &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999] animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[28rem] max-w-[90vw] animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <WarningIcon className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Release</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Releasing this loan will generate the payment schedule and activate the loan. Do you want to proceed?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRelease}
                    disabled={isPending}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                      isPending
                        ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isPending ? (
                      <><span className="loading loading-spinner loading-sm mr-2"></span>Releasing...</>
                    ) : (
                      "Confirm Release"
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body // renders outside boardformmodal
          )
        }
      </div>
    </div>
  )
}

export default CoopLoansReleases
