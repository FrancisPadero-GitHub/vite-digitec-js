import { useState, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";

// components

import FilterToolbar from "../shared/components/FilterToolbar";
import DataTableV2 from "../shared/components/DataTableV2";

// constants
import {
  LOAN_ACCOUNT_STATUS_COLORS,
  LOAN_PRODUCT_COLORS,
} from "../../constants/Color";

// utils
import { display } from "../../constants/numericFormat";
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

// Restriction
import useLoanRestriction from "../../backend/hooks/member/utils/useRestriction";

/**
 * if tenure is under 1 year                (DISABLES ACCESS TO UI)
 * if age is under 18 years                 (DISABLES ACCESS TO UI)
 * if myShares is less than or equals 5000  (DISABLES ACCESS TO UI)
 *
 * PS: TO CONFIGURE THIS PAGE THIS CONDITIONS MUST BE MET FIRST
 */

function MemberLoanAcc() {
  const navigate = useNavigate();
  const { hasRestriction } = useLoanRestriction();

  const { data: loanProducts } = useFetchLoanProducts();

  // get the outstanding balance on this view table instead of the base table
  const { data: loanAccView } = useFetchLoanAccView({
    useLoggedInMember: true,
  });
  const loanAccViewRaw = loanAccView?.data || [];

  const {
    data: loanAcc,
    isLoading,
    isError,
    error,
  } = useFetchLoanAcc({ useLoggedInMember: true });
  const loanAccRaw = loanAcc?.data || [];

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
  const [isPending, startTransition] = useTransition();

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
    return mergedLoanAccounts.filter((row) => {
      const generatedId = `${TABLE_PREFIX}${row.loan_id}`;

      const matchesSearch =
        searchTerm === "" ||
        row.amount_req?.toString().includes(searchTerm) ||
        row.total_amount_due?.toString().includes(searchTerm) ||
        row.loan_ref_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.status?.toLowerCase().includes(searchTerm.toLowerCase());
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
      .join(" - ") || "Showing all loan accounts";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  // modal open handler
  const openModal = (row) => {
    navigate(`../loan-account/details/${row.loan_id}`);
  };

  if (hasRestriction) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-xl border border-red-200">
        <h2 className="text-xl font-semibold text-red-600">
          You are not eligible for loan applications
        </h2>
        <p className="text-gray-700 mt-2">
          Please contact the administrator or board members for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="m-3">
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isFilterPending={isPending}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Status",
                value: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Closed", value: "Closed" },
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
          title={"My Loan Accounts"}
          filterActive={activeFiltersText !== "Showing all loan accounts"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Loan Ref No.",
            "Total Amount Due",
            "Outstanding Balance",
            "Total Paid",
            "Loan Type",
            "Status",
          ]}
          data={memberLoanAccounts}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;

            const loanRefNo = row?.loan_ref_number || "Not found";
            const totalAmountDue = row?.total_amount_due || 0;
            const outstandingBalance = row?.outstanding_balance || 0;
            const totalPaid = row?.total_paid || 0;
            const status = row?.status || "Not found";

            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50 text-center"
                onClick={() => openModal(row)}
              >
                {/* Loan Ref No. */}
                <td className="font-medium text-xs">{loanRefNo}</td>

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
                    <span
                      className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}
                    >
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">
                      Not Provided
                    </span>
                  )}
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
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}

export default MemberLoanAcc;
