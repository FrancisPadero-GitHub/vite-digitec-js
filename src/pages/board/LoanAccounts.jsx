import { useState, useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView"
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// components
import FilterToolbar from '../shared/components/FilterToolbar';
import DataTableV2 from '../shared/components/DataTableV2';

// constants
import { LOAN_PRODUCT_COLORS, LOAN_ACCOUNT_STATUS_COLORS } from "../../constants/Color";
import placeHolderAvatar from '../../assets/placeholder-avatar.png';

// utils
import { display } from '../../constants/numericFormat';
import { useDebounce } from '../../backend/hooks/treasurer/utils/useDebounce';

function LoanAccounts() {
  const navigate = useNavigate();
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: loanProducts } = useFetchLoanProducts();

  // get the outstanding balance on this view table instead of the base table
  const { data: loanAccView } = useFetchLoanAccView();
  const loanAccViewRaw = loanAccView?.data || [];

  const { data: loanAcc, isLoading, isError, error } = useFetchLoanAcc();
  const loanAccRaw = loanAcc?.data || [];

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

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "LACC_";
  const memberLoanAccounts = useMemo(() => {
    const members = members_data?.data || [];
    return mergedLoanAccounts.filter((row) => {
      const generatedId = `${TABLE_PREFIX}${row?.loan_id || ""}`;

      const member = members?.find((m) => m.account_number === row.account_number);
      const fullName = member
        ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
        : "";

      const matchesSearch =
        debouncedSearch === "" ||
        (fullName && fullName.includes(debouncedSearch)) ||
        row.loan_ref_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.status?.toLowerCase().includes(debouncedSearch.toLowerCase());
      generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === "" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mergedLoanAccounts, debouncedSearch, statusFilter, members_data]);

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : null,
    statusFilter ? `${statusFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all loan accounts";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // React Hook Form setup for Loan Accounts
  const {
    reset: resetLoanAcc,
  } = useForm({
    defaultValues: {
      application_id: null,
      account_number: null,
      loan_ref_number: "",
      principal: "",
      outstanding_balance: "",
      interest_rate: "",
      interest_method: "",
      status: "Active",
      release_date: null, // will be configured by treasurer
      maturity_date: "",
    },
  });

  const openModal = (row) => {

    // console.log("Opened modal data name check", row )
    const matchedLoanProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );

    resetLoanAcc({
      application_id: row.application_id, // will be used to fetch from members to display the name
      account_number: row.account_number,
      loan_ref_number: row.loan_ref_number,
      principal: row.amount,
      outstanding_balance: row.amount,
      interest_rate: Number(matchedLoanProduct?.interest_rate) || 0,
      interest_method: matchedLoanProduct?.interest_method ?? "",
      status: row.status,
      release_date: row.release_date,
      maturity_date: row.release_date,
    });

    navigate(`../loan-account/details/${row.loan_id}`);
  }


  return (
    <div className="m-3">
      <div className="space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 mb-5">
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
                  { label: "Active", value: "Active" },
                  { label: "Defaulted", value: "Defaulted" },
                  { label: "Renewed", value: "Renewed" },
                ],
              },
            ]}
          />
        </div>

        <DataTableV2
          title={"Loan Accounts"}
          filterActive={activeFiltersText !== "Showing all loan accounts"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Loan Ref No.", "Account No.", "Name", "Total Amount Due", "Outstanding Balance", "Total Paid", "Loan Type", "Status",]}
          data={memberLoanAccounts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number
            );

            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";

            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;

            const loanRefNo = row?.loan_ref_number || "Not found";
            const accountNo = row?.account_number || "Not found";
            const avatarUrl = matchedMember?.avatar_url || placeHolderAvatar;
            const totalAmountDue = row?.total_amount_due || 0;
            const outstandingBalance = row?.outstanding_balance || 0;
            const totalPaid = row?.total_paid || 0;
            const status = row?.status || "Not found";

            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50 text-center"
                onDoubleClick={() => openModal(row)}
              >

                {/* Loan Ref No. */}
                <td className="font-medium text-xs">
                  {loanRefNo}
                </td>

                {/* Account No. */}
                <td className="font-medium text-xs">
                  {accountNo}
                </td>

                {/* Full Name */}
                <td>
                  <span className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={avatarUrl}
                          alt={fullName}
                        />
                      </div>
                    </div>
                    <div className="truncate">
                      {fullName ||
                        <span className="text-gray-400 italic">
                          Not Provided
                        </span>}
                    </div>
                  </span>
                </td>

                {/* Total Amount Due */}
                <td className="font-semibold text-success">
                  ₱ {display(totalAmountDue)}
                </td>

                {/* Outstanding Balance */}
                <td className="font-semibold text-success">
                  ₱ {display(outstandingBalance)}
                </td>

                {/* Total Paid */}
                <td className="font-semibold text-success">
                  ₱ {display(totalPaid)}
                </td>

                {/* Loan Product */}
                <td>
                  {loanProductName ? (
                    <span className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}>
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>

                {/* Status */}
                <td>
                  {status ? (
                    <span className={`badge font-semibold ${LOAN_ACCOUNT_STATUS_COLORS[row.status] || "badge-error"}`}>
                      {row.status || "Not Provided"}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
              </tr>
            )
          }}
        />
      </div>


    </div>
  )
}

export default LoanAccounts
