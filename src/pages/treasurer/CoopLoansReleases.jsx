import { useState, useMemo, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import dayjs from "dayjs";
import { createPortal } from "react-dom"; // lets confirmation modal escape parent container (fixes z-index & overlay issues)
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useMemberRole } from "../../backend/context/useMemberRole";

// mutation hooks
import { useEditLoanAcc } from "../../backend/hooks/treasurer/useEditLoanAcc";

// components
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import BoardFormModal from "../board/modal/BoardFormModal";

// colors
import { LOAN_ACCOUNT_STATUS_COLORS } from "../../constants/Color";
import placeHolderAvatar from "../../assets/placeholder-avatar.png";

// utils
import { display } from "../../constants/numericFormat";
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

function CoopLoansReleases() {
  const { mutate: releaseLoan, isPending } = useEditLoanAcc();

  //  const navigate = useNavigate();
  const { data: members_data } = useMembers({});
  const { data: loanProducts } = useFetchLoanProducts();
  const { memberRole } = useMemberRole();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // get the outstanding balance on this view table instead of the base table
  const { data: loanAccView } = useFetchLoanAccView();
  const loanAccViewRaw = loanAccView?.data || [];

  const { data: loanAcc, isLoading, isError, error } = useFetchLoanAcc();
  const loanAccRaw = loanAcc?.data || [];
  const members = members_data?.data || [];

  // Merge view and base table by loan_id
  const mergedLoanAccounts = loanAccRaw.map((baseRow) => {
    const viewRow = loanAccViewRaw.find((v) => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow, // all base table fields
      ...viewRow,
    };
  });

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  /**
   * Use Transitions handler for the filtertable to be smooth and stable if the datasets grow larger
   * it needs to be paired with useMemo on the filtered data (clubFunds)
   *
   */
  // Add useTransition
  const [isFilterPending, startTransition] = useTransition();

  // Update filter handlers to use startTransition
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  };
  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value);
    });
  };
  const handleYearChange = (value) => {
    startTransition(() => {
      setYearFilter(value);
    });
  };
  const handleMonthChange = (value) => {
    startTransition(() => {
      setMonthFilter(value);
    });
  };

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "LACC_";
  const memberLoanAccounts = useMemo(() => {
    const members = members_data?.data || [];
    return mergedLoanAccounts.filter((row) => {
      const generatedId = `${TABLE_PREFIX}${row?.loan_id || ""}`;

      const member = members?.find(
        (m) => m.account_number === row.account_number
      );
      const fullName = member
        ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
        : "";

      const matchesSearch =
        debouncedSearch === "" ||
        (fullName && fullName.includes(debouncedSearch)) ||
        row.account_number
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        row.status?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === "" || row.status === statusFilter;
      const date = row.release_date ? new Date(row.release_date) : null;
      const matchesYear =
        yearFilter === "" ||
        (date && date.getFullYear().toString() === yearFilter);

      // To avoid subtext displaying numbers instead of month names
      // I had to convert the values from the monthFilter to numbers for comparison
      const monthNameToNumber = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
      const filterMonthNumber = monthFilter
        ? monthNameToNumber[monthFilter]
        : null;
      const matchesMonth =
        monthFilter === "" ||
        (date && date.getMonth() + 1 === filterMonthNumber);

      return matchesSearch && matchesStatus && matchesYear && matchesMonth;
    });
  }, [
    mergedLoanAccounts,
    debouncedSearch,
    statusFilter,
    yearFilter,
    monthFilter,
    members_data,
  ]);

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      statusFilter ? `${statusFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all loan releases";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  // Modal and Form setup
  const [modalType, setModalType] = useState(null);
  const defaultValues = {
    loan_id: "",
    loan_ref_number: "",
    application_id: "",
    applicant_name: "",
    account_number: "",
    net_principal: "",
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
    defaultValues,
  });

  // watch schedule-related fields
  const firstDue = watch("first_due");
  const loanTerm = watch("loan_term");

  // auto-calculate maturity_date whenever first_due or loan_term changes
  useEffect(() => {
    if (!firstDue) return;
    const months = Math.max(Number(loanTerm) - 1, 0); // subtract 1 month, clamp at 0
    const newMaturity = dayjs(firstDue)
      .add(months, "month")
      .format("YYYY-MM-DD");
    const current = watch("maturity_date");
    if (current !== newMaturity) {
      setValue("maturity_date", newMaturity);
    }
  }, [firstDue, loanTerm, setValue, watch]);

  const openModal = (row) => {
    // console.log(row)
    setModalType("edit");
    const matchedMember = members?.find(
      (member) => member.account_number === row.account_number
    );
    const fullName = matchedMember
      ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
      : "Not Found";

    const matchedLoanProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );
    const loanTerm = row?.loan_term_approved || 0;
    const interestMethod = matchedLoanProduct?.interest_method ?? "";
    const interestRate = Number(matchedLoanProduct?.interest_rate) || 0;
    const loanProductName = matchedLoanProduct?.name || "N/A";

    // This might confuse you but all this modal will update is the release_date column just refer to the hook
    reset({
      ...row,
      applicant_name: fullName,
      loan_term: loanTerm,
      net_principal: row?.net_principal || 0,
      interest_rate: interestRate,
      interest_method: interestMethod,
      loanProductName: loanProductName,
    });
  };

  const handleConfirmRelease = () => {
    const data = getValues(); // Get form data
    // console.log(data)
    releaseLoan(data, {
      onSuccess: () => {
        toast.success("Loan released successfully!");
        setShowConfirmModal(false);
        closeModal();
      },
      onError: () => {
        toast.error("Something went wrong!");
        setShowConfirmModal(false);
      },
    });
  };

  const onSubmit = () => {
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="m-3">
      <Toaster position="bottom-left" />
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isFilterPending={isFilterPending}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Status",
                value: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { label: "Pending Release", value: "Pending Release" },
                  { label: "Active", value: "Active" },
                ],
              },
              {
                label: "All Year",
                value: yearFilter,
                onChange: handleYearChange,
                options: yearOptions,
              },
              {
                label: "All Month",
                value: monthFilter,
                onChange: handleMonthChange,
                options: [
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ],
              },
            ]}
          />
        </div>

        <DataTableV2
          title={"Loan Releases"}
          filterActive={activeFiltersText !== "Showing all loan releases"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Loan Ref No.",
            "Account No.",
            "Name",
            "Amount Requested",
            "Status",
            "Release",
          ]}
          data={memberLoanAccounts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number
            );

            const fullName = matchedMember
              ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
              : "Not Found";

            const id = row?.loan_id || "Not found";
            const loanRefNo = row?.loan_ref_number || "Not found";
            const accountNo = row?.account_number || "Not found";
            const avatarUrl = matchedMember?.avatar_url || placeHolderAvatar;
            const principalAmount = row?.net_principal || 0;
            const status = row?.status || "Not found";
            const releaseDate = row?.release_date
              ? new Date(row.release_date).toLocaleDateString()
              : "Not Found";

            return (
              <tr
                key={id}
                className="cursor-pointer hover:bg-base-200/50 text-center"
                onClick={() => openModal(row)}
              >
                {/* Loan Ref No. */}
                <td className="font-medium text-xs">{loanRefNo}</td>

                {/* Account No. */}
                <td className="font-medium text-xs">{accountNo}</td>

                {/* Full Name */}
                <td>
                  <span className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img src={avatarUrl} alt={fullName} />
                      </div>
                    </div>
                    <div className="truncate">
                      {fullName || (
                        <span className="text-gray-400 italic">
                          Not Provided
                        </span>
                      )}
                    </div>
                  </span>
                </td>

                {/* Principal */}
                <td className="font-semibold text-success">
                  ₱ {display(principalAmount)}
                </td>

                {/* Status */}
                <td>
                  {status ? (
                    <span
                      className={`badge font-semibold ${LOAN_ACCOUNT_STATUS_COLORS[row.status] || "badge-error"}`}
                    >
                      {row.status || "Not Provided"}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">
                      Not Provided
                    </span>
                  )}
                </td>

                {/* Application Date */}
                <td>{releaseDate}</td>
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
          <div className="pl-1 pr-2">
            {/* Release dates */}
            <div className="p-3 bg-white rounded-lg border-2 border-gray-200 mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold mb-2">Loan Release</h3>

                <div className="mb-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold
                    ${
                      watch("status") === "Active"
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-yellow-50 border-yellow-300 text-yellow-700"
                    }`}
                  >
                    <span
                      className={
                        watch("status") === "Active"
                          ? "text-green-600"
                          : "text-yellow-500"
                      }
                    >
                      ●
                    </span>
                    {watch("status")}
                  </div>
                  <input type="hidden" value={watch("status")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {watch("status") === "Active"
                      ? "Released On"
                      : "Release Date"}
                  </label>
                  {watch("status") === "Active" ? (
                    <div className="px-3 py-2 bg-green-50 rounded border border-green-200 flex items-center gap-2">
                      <CheckCircleOutlinedIcon
                        fontSize="small"
                        className="text-green-600"
                      />
                      <div className="text-sm font-semibold text-green-900">
                        {watch("release_date")
                          ? dayjs(watch("release_date")).format("MMM DD, YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="date"
                      {...register("release_date", { required: true })}
                      className="input input-bordered w-full border-green-400 focus:border-green-600"
                    />
                  )}
                  {errors.release_date && (
                    <p className="text-error text-xs mt-1">
                      Release date is required
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("release_date", dayjs().format("YYYY-MM-DD"))
                    }
                    disabled={
                      !!watch("release_date") || watch("status") === "Active"
                    }
                    className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all
                      ${
                        watch("release_date") || watch("status") === "Active"
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
                  <CheckCircleOutlinedIcon
                    fontSize="inherit"
                    className="text-green-700 text-[14px]"
                  />
                  <span className="text-xs text-green-800 leading-tight">
                    <strong>Ready to release:</strong> Click
                    &ldquo;Release&rdquo; to activate this loan and generate the
                    payment schedule.
                  </span>
                </div>
              )}

              {/* if release date is not yet set */}
              {!watch("release_date") && watch("status") !== "Active" && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded flex items-start gap-2">
                  <span className="text-xs text-amber-800">
                    <strong>Pending:</strong> Set a release date to proceed with
                    loan activation.
                  </span>
                </div>
              )}
            </div>

            {/* Account info */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Account Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Loan Ref No.
                  </label>
                  <div className="text-sm font-mono font-bold">
                    {watch("loan_ref_number")}
                  </div>
                  <input type="hidden" value={watch("loan_ref_number")} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Account No.
                  </label>
                  <div className="text-sm font-semibold">
                    {watch("account_number")}
                  </div>
                  <input type="hidden" {...register("account_number")} />
                </div>

                <div className="md:col-span-1 col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Account Holder
                  </label>
                  <div className="text-sm font-bold">
                    {watch("applicant_name")}
                  </div>
                </div>
              </div>
            </div>

            {/* Loan details */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-600 mb-2">
                  Loan Details
                </h4>

                {/* Loan Type */}
                <span className="text-xs font-semibold text-gray-700 badge badge-ghost">
                  {watch("loanProductName") || "N/A"}
                </span>
              </div>

              {/* Principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Principal
                  </label>
                  <div className="px-3 py-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-semibold">
                      ₱
                      {watch("net_principal")
                        ? parseFloat(watch("net_principal")).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "0.00"}
                    </div>
                  </div>
                  <input
                    type="hidden"
                    {...register("net_principal", { required: true })}
                  />
                  {errors.net_principal && (
                    <p className="text-error text-xs mt-1">Required</p>
                  )}
                </div>

                {/* Total interest */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Total Interest
                  </label>
                  <div className="px-3 py-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-semibold">
                      ₱
                      {watch("total_interest")
                        ? parseFloat(watch("total_interest")).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "0.00"}
                    </div>
                  </div>
                  <input
                    type="hidden"
                    {...register("total_interest", { required: true })}
                  />
                  {errors.total_interest && (
                    <p className="text-error text-xs mt-1">Required</p>
                  )}
                </div>

                {/* Total amount due */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Total Amount Due
                  </label>
                  <div className="px-3 py-2 bg-blue-100 rounded border border-blue-300">
                    <div className="text-sm font-bold">
                      ₱
                      {watch("total_amount_due")
                        ? parseFloat(watch("total_amount_due")).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "0.00"}
                    </div>
                  </div>
                  <input
                    type="hidden"
                    {...register("total_amount_due", { required: true })}
                  />
                  {errors.total_amount_due && (
                    <p className="text-error text-xs mt-1">Required</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Payment Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    First Due Date
                  </label>
                  {watch("status") === "Active" ? (
                    <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                      <div className="text-sm font-semibold">
                        {watch("first_due")
                          ? dayjs(watch("first_due")).format("MM/DD/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="date"
                      {...register("first_due", { required: true })}
                      className="input input-bordered w-full border-gray-400 focus:border-blue-600 font-semibold"
                    />
                  )}
                  {errors.first_due && (
                    <p className="text-error text-xs mt-1">
                      First due date is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Maturity Date
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">
                      {watch("maturity_date")
                        ? dayjs(watch("maturity_date")).format("MM/DD/YYYY")
                        : "N/A"}
                    </div>
                  </div>
                  {/* hidden registered field to submit value */}
                  <input
                    type="hidden"
                    {...register("maturity_date", { required: true })}
                  />
                  {errors.maturity_date && (
                    <p className="text-error text-xs mt-1">
                      Maturity date required
                    </p>
                  )}
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
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Confirm Release
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Releasing this loan will generate the payment schedule and
                      activate the loan. Do you want to proceed?
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
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Releasing...
                      </>
                    ) : (
                      "Confirm Release"
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body // renders outside boardformmodal
          )}
      </div>
    </div>
  );
}

export default CoopLoansReleases;
