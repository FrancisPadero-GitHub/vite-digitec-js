import {useState} from 'react'
import { useNavigate } from 'react-router-dom';

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// components
import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';

// constants
import { LOAN_ACCOUNT_STATUS_COLORS, LOAN_PRODUCT_COLORS } from "../../constants/Color";

function MemberLoanAcc() {
  const navigate = useNavigate();
  const { data: members_data } = useMembers();
  const members = members_data?.data || [];
  const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanApps, isLoading, isError, error } = useFetchLoanAcc({page, limit,useLoggedInMember: true});
  const loanAppRaw = loanApps?.data || [];
  const total = loanAppRaw?.count || 0;

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const TABLE_PREFIX = "LACC_";

  const memberLoanAccounts = loanAppRaw.filter((row) => {

    const member = members?.find((m) => m.member_id === row.applicant_id);
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


  if (isLoading) return <div>Loading Loan Accounts...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Members Loan Accounts</h1>
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
            "Balance",
            "Loan Type",
            "Interest rate",
            "Method",
            "Term",
            "Maturity Date",
            "Status",
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
                <td className="text-center px-2 py-2 text-xs">
                  {row.account_number || "ID"}
                </td>

                {/* Member name */}
                <td className="py-2 px-4">
                  <span className="flex items-center gap-2">
                    {matchedMember
                      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                      : "System"}
                  </span>

                </td>
                {/* Principal */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.principal?.toLocaleString() || "0"}
                </td>

                {/* Balance */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.outstanding_balance?.toLocaleString() || "0"}
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

                {/* Interest Rate */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  {interestRate || "0"} %
                </td>

                {/* Interest Method */}
                <td className="px-2 py-2 text-center">
                  {interestMethod || "Not Found"}
                </td>

                {/* Loan Term */}
                <td className="px-2 py-2 text-center">
                  {loanTerm || "Not Found"} Months
                </td>

                {/* Maturity Date */}
                <td className="px-2 py-2 text-center">
                  {row.maturity_date
                    ? new Date(row.maturity_date).toLocaleDateString()
                    : "Not Found"}
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  {row.status ? (
                    <span className={`badge font-semibold ${LOAN_ACCOUNT_STATUS_COLORS[row.status]}`}>
                      {row.status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
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
