import { useState} from 'react'
import { useNavigate } from 'react-router-dom';

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from '../../backend/hooks/shared/useFetchLoanAccView';
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// components
import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';

// constants
import { LOAN_ACCOUNT_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";

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

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // get the outstanding balance on this view table instead of the base table 
  const { data: loanAccView } = useFetchLoanAccView({ page, limit, useLoggedInMember: true });
  const loanAccViewRaw = loanAccView?.data || [];

  const { data: loanAcc, isLoading, isError, error } = useFetchLoanAcc({page, limit, useLoggedInMember: true});
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
      ? `${member.f_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (row) => {
    navigate(`../loan-account/details/${row.loan_id}`);
  }



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
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">My Loan Accounts</h1>
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
            "Amount Req",
            "Principal",
            "Interest Rate",
            "Total Amount Due",
            "Balance",
            "Total Paid",
            "Loan Type",
            "Status",
            "Release",
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

            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;
            const interestRate = matchedLoanProduct?.interest_rate.toLocaleString();

            // const loanTerm = matchedLoanProduct?.max_term_months.toLocaleString();

            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openModal(row)}
              >
                 {/* Loan Ref number */}
                <td className="text-center px-2 py-2 text-xs font-medium">
                  {row.loan_ref_number || "ID"}
                </td>

                {/* Amount Req */}
                <td className="px-2 py-2 text-center font-semibold text-info">
                  ₱ {row.amount_req?.toLocaleString() || "0"}
                </td>

                {/* Principal */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.principal?.toLocaleString() || "0"}
                </td>

                {/* Interest Rate */}
                <td className="px-2 py-2 text-center font-semibold text-warning">
                  {interestRate || "0"} %
                </td>

                {/* total amount due */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.total_amount_due?.toLocaleString() || "0"}
                </td>

                {/* Balance */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.outstanding_balance?.toLocaleString() || "0"}
                </td>

                {/* total paid */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.total_paid?.toLocaleString() || "0"}
                </td>

                {/* Loan Product */}
                <td className="px-4 py-2 text-center">
                  {loanProductName ? (
                    <span className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}>
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  {row.status ? (
                    <span className={`badge badge-soft font-semibold ${LOAN_ACCOUNT_STATUS_COLORS[row.status]}`}>
                      {row.status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  {row.release_date
                    ? new Date(row.release_date).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  )
}

export default MemberLoanAcc
