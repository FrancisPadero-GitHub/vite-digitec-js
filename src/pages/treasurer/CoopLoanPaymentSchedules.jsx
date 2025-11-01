import {useState} from 'react'
import { useNavigate } from 'react-router';

// react redux stuff
import { useDispatch } from 'react-redux';
import { openLoanPaymentModal } from '../../features/redux/modalSlice';

// fetch hooks
import { useMemberRole } from '../../backend/context/useMemberRole';
import { useFetchPaySchedView } from '../../backend/hooks/shared/useFetchPaySchedView'


// component
import MainDataTable from './components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';


function CoopLoanPaymentSchedules() {
  const { memberRole } = useMemberRole(); // to hide the go to payments in board view

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data, isLoading, isError, error } = useFetchPaySchedView({ page, limit })
  const total = data?.count || 0;
  const paySchedules = data?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [statusFilter, setStatusFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  
  const filteredPaySchedules = paySchedules.filter((row) => {
    const fullName = row?.full_name || "";
    const scheduleId = `LPS_${row?.schedule_id}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.payment_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.loan_ref_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheduleId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || row.payment_status === statusFilter;


    const date = row.due_date ? new Date(row.due_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesStatus  && matchesYear && matchesMonth;
  });

  const handleGoToPayments = () => {
    // do nothing for board role
    if (memberRole === 'board') return navigate(`/${memberRole}/coop-loans/loan-payments`);

    // for treasurer role, open the modal after navigating
    if (memberRole === 'treasurer') {
      navigate(`/${memberRole}/coop-loans/payments`);                                 // Navigate to payments page
      dispatch(openLoanPaymentModal({ type: 'add', data: "Redux is GOATED" }));       // Dispatch the modal action
    }


  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold" >Member Loan Payment Schedules</h1>
          <div className="flex flex-row items-center gap-3">
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={handleGoToPayments}

            >
              Go to Payments
            </button>
          </div>
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
                { label: "Paid", value: "PAID" },
                { label: "Partial", value: "PARTIALLY PAID" },
                { label: "Overdue", value: "OVERDUE" },
              ],
            },
            {
              label: "All Year Due",
              value: yearFilter,
              onChange: setYearFilter,
              options: [
                { label: "2026", value: "2026" },
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },

              ],
            },
            {
              label: "All Month Due",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
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
          "Payment Status",
          "Paid At",
          "Months Overdue"
        ]}
        data={filteredPaySchedules}
        isLoading={isLoading}
        isError={isError}
        error={error}
        page={page}
        limit={limit}
        total={total}
        setPage={setPage}
        renderRow={(row) => {
          const fullName = row?.full_name || "System";
          const currentIndex = filteredPaySchedules.indexOf(row);
          const rowNumber = (page - 1) * limit + currentIndex + 1;
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

          return (
            <tr
              key={`${row?.schedule_id}`}
              onClick={() => console.log(`Clicked on Schedule ID: LPS_${row}`)}
              className={`transition-colors cursor-pointer ${getRowStyling()}`}
            >
              {/* Row Number */}
              <td className="px-4 py-2 text-center font-medium text-sm">
                {rowNumber}
              </td>

              {/* Schedule ID */}
              <td className="px-4 py-2 text-center font-medium text-xs">
                {row?.schedule_id}
              </td>

              {/* Loan Ref No. */}
              <td className="px-4 py-2 text-center">
                {row?.loan_ref_number || "Not Found"}
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
              <td className="px-4 py-2 text-center">
                {row?.due_date || "—"}
              </td>

              {/* Principal Due */}
              <td className="px-4 py-2 text-center">
                ₱ {row?.principal_due?.toLocaleString() || "0"}
              </td>

              {/* Interest Due */}
              <td className="px-4 py-2 text-center">
                ₱ {row?.interest_due?.toLocaleString() || "0"}
              </td>

              {/* Fee Due */}
              <td className="px-4 py-2 text-center">
                ₱ {row?.fee_due?.toLocaleString() || "0"}
              </td>

              {/* Total Due */}
              <td className="px-4 py-2 font-semibold text-success text-center">
                ₱ {row?.total_due?.toLocaleString() || "0"}
              </td>

              {/* Amount Paid */}
              <td className="px-4 py-2 font-semibold text-center">
                ₱ {row?.amount_paid?.toLocaleString() || "0"}
              </td>

              {/* Payment Status */}
              <td className="px-4 py-2 font-semibold text-info text-center">
                {row?.payment_status || "UNPAID"}
              </td>

              {/* Paid At */}
              <td className="px-4 py-2 text-center">
                {row?.paid_at || "—"}
              </td>

              {/* Months Overdue */}
              <td className="px-4 py-2 text-center">
                {row?.mos_overdue ?? 0}
              </td>
            </tr>
          );
        }}
      />
      </div>
    </div>
  )
}

export default CoopLoanPaymentSchedules
