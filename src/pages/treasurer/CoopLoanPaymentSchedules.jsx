import {useState, useMemo, useTransition} from 'react'
import { useNavigate } from 'react-router';

// react redux stuff
import { useDispatch } from 'react-redux';
import { openLoanPaymentModal } from '../../features/redux/paymentModalSlice';

// fetch hooks
import { useMemberRole } from '../../backend/context/useMemberRole';
import { useFetchPaySchedView } from '../../backend/hooks/shared/useFetchPaySchedView'

// component
import FilterToolbar from '../shared/components/FilterToolbar';
import DataTableV2 from '../shared/components/DataTableV2';

// utils
import { display } from '../../constants/numericFormat';
import { useDebounce } from '../../backend/hooks/treasurer/utils/useDebounce';


function CoopLoanPaymentSchedules() {
  const { memberRole } = useMemberRole(); // to hide the go to payments in board view

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, isError, error } = useFetchPaySchedView({}) // temporarily disabled pagination
  // const paySchedules = data?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
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
  
  const TABLE_PREFIX = "LPS_";
  const filteredPaySchedules = useMemo(() => {
    const paySchedules = data?.data || [];
      return paySchedules.filter((row) => {
      const scheduleId = `${TABLE_PREFIX}${row?.schedule_id}`;

      const matchesSearch =
        debouncedSearch === "" ||
          (row.full_name && row.full_name
            .toLowerCase()
            .includes(debouncedSearch
              .toLowerCase())) ||
        row.payment_status?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.loan_ref_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        scheduleId.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "" || row.payment_status === statusFilter;
      const date = row.due_date ? new Date(row.due_date) : null;
      const matchesYear =
        yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);

      // To avoid subtext displaying numbers instead of month names
      // I had to convert the values from the monthFilter to numbers for comparison
      const monthNameToNumber = {
        January: 1, February: 2,
        March: 3, April: 4,
        May: 5, June: 6,
        July: 7, August: 8,
        September: 9, October: 10,
        November: 11, December: 12,
      };
      const filterMonthNumber = monthFilter ? monthNameToNumber[monthFilter] : null;
      const matchesMonth =
        monthFilter === "" || (date && (date.getMonth() + 1)=== filterMonthNumber);

      return matchesSearch && matchesStatus  && matchesYear && matchesMonth;
  });
}, [debouncedSearch, statusFilter, yearFilter, monthFilter, data]);

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : null,
    statusFilter ? `${statusFilter}` : null,
    yearFilter ? `${yearFilter}` : null,
    monthFilter ? `${monthFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all payment schedules";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  const handleGoToPayments = () => {
    // Navigate to payments page for both roles
    navigate(`/${memberRole}/coop-loans/payments`);

    // For treasurer role, also open the modal after navigating
    if (memberRole === 'treasurer') {
      dispatch(openLoanPaymentModal({ type: 'add', data: "Redux is GOATED" }));       // Dispatch the modal action
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
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
                  { label: "Paid", value: "PAID" },
                  { label: "Partial", value: "PARTIALLY PAID" },
                  { label: "Overdue", value: "OVERDUE" },
                ],
              },
              {
                label: "All Year Due",
                value: yearFilter,
                onChange: handleYearChange,
                options: yearOptions,
              },
              {
                label: "All Month Due",
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

          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={handleGoToPayments}
            >
              Go to Payments
            </button>
          </div>
        </div>
      
        <DataTableV2
          title={"Member Loan Payment Schedules"}
          filterActive={activeFiltersText !== "Showing all payment schedules"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "#",
            "Schedule ID",
            "Loan Ref No.",
            "Member Name",
            "Due Date",
            "Principal Due",
            "Interest Due",
            "Fee Due",
            "Total Due",
            "Amount Paid",
            "Status",
            "Paid At",
            "Months Overdue"
          ]}          
          data={filteredPaySchedules}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row, index) => {
            const fullName = row?.full_name || "System";
            const rowNumber = (typeof index === 'number' 
              ? index : filteredPaySchedules.findIndex(item => item.schedule_id === row.schedule_id)) + 1;
            const isOverdue = row?.payment_status === "OVERDUE";
            const isPartiallyPaid = row?.payment_status === "PARTIALLY PAID";
            const isPaid = row?.payment_status === "PAID" || row?.payment_status === "FULLY PAID";
            
            const getRowStyling = () => {
              if (isOverdue) {
                return "bg-warning/20 hover:bg-warning/30 border-l-4 border-warning";
              } else if (isPartiallyPaid) {
                return "bg-info/20 hover:bg-info/30 border-l-4 border-info";
              } else if (isPaid) {
                return "bg-success/20 hover:bg-success/30 border-l-4 border-success";
              } else {
                return "hover:bg-base-200/70";
              }
            };

            const scheduleId = `${TABLE_PREFIX}${row?.schedule_id}`;
            const loanRefNo = row?.loan_ref_number || "Not Found";
            const dueDate = row?.due_date ? new Date(row.due_date).toLocaleDateString() : "Not Found";
            const principalDue = row?.principal_due || 0;
            const interestDue = row?.interest_due || 0;
            const feeDue = row?.fee_due || 0;
            const totalDue = row?.total_due || 0;
            const amountPaid = row?.amount_paid || 0;
            const paymentStatus = row?.payment_status || "UNPAID";
            const paidAt = row?.paid_at ? new Date(row.paid_at).toLocaleDateString() : "Not Paid";
            const monthsOverdue = row?.mos_overdue || 0;

            return (
              <tr
                key={`${row?.schedule_id}`}
                onDoubleClick={() => console.log(`Clicked on Schedule ID: LPS_${row?.schedule_id}`)}
                className={`transition-colors cursor-pointer ${getRowStyling()} text-center`}
              >
                {/* Row Number */}
                <td className=" font-medium text-sm">
                  {rowNumber}
                </td>

                {/* Schedule ID */}
                <td className=" font-medium text-xs">
                  {scheduleId}
                </td>

                {/* Loan Ref No. */}
                <td className="font-medium text-xs">
                  {loanRefNo}
                </td>

                {/* Member Name */}
                <td className="px-4 py-4 text-center">
                  <span className="flex items-center gap-3">
                    <div className="avatar">
                    </div>
                    <div className="truncate">
                      {fullName || (
                        <span className="text-gray-400 italic">Not Found</span>
                      )}
                    </div>
                  </span>
                </td>

                {/* Due Date */}
                <td className="">
                  {dueDate}
                </td>

                {/* Principal Due */}
                <td className="">
                  ₱ {display(principalDue)}
                </td>

                {/* Interest Due */}
                <td className="">
                  ₱ {display(interestDue)}
                </td>

                {/* Fee Due */}
                <td className="">
                  ₱ {display(feeDue)}
                </td>

                {/* Total Due */}
                <td className="font-semibold text-success">
                  ₱ {display(totalDue)}
                </td>

                {/* Amount Paid */}
                <td className="font-semibold">
                  ₱ {display(amountPaid)}
                </td>

                {/* Payment Status */}
                <td className="font-semibold text-info">
                  {paymentStatus}
                </td>

                {/* Paid At */}
                <td>
                  {paidAt}
                </td>

                {/* Months Overdue */}
                <td>
                  {monthsOverdue}
                </td>
              </tr>
            )
          }}
        />
      </div>
    </div>
  )
}

export default CoopLoanPaymentSchedules
