import {useState} from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

// fetch hooks
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView} from "../../backend/hooks/shared/useFetchLoanAccView"
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanProducts } from '../../backend/hooks/shared/useFetchLoanProduct';

// components
import MainDataTable from '../treasurer/components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';

// constants
import { LOAN_PRODUCT_COLORS } from "../../constants/Color";

function LoanAccounts() {
   const navigate = useNavigate();
  const { data: members_data } = useMembers();
  const members = members_data?.data || [];
   const { data: loanProducts } = useFetchLoanProducts();

  // Data fetch on loan applications and pagination control
  const [page, setPage] = useState(1);
  const [limit] = useState(20);


  // get the outstanding balance on this view table instead of the base table 
  const { data: loanAccView } = useFetchLoanAccView({page, limit});
  const loanAccViewRaw = loanAccView?.data || [];

  const { data: loanAcc, isLoading, isError, error } = useFetchLoanAcc({page, limit});
  const loanAccRaw = loanAcc?.data || [];
  const total = loanAccRaw?.count || 0;

  // Merge view and base table by loan_id
  const mergedLoanAccounts = loanAccRaw.map(baseRow => {
    const viewRow = loanAccViewRaw.find(v => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow, // all base table fields
      total_paid: viewRow?.total_paid || 0,
      outstanding_balance: viewRow?.outstanding_balance || 0,
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
      row.loan_ref_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number
            );
            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";
            const matchedLoanProduct = loanProducts?.find(
              (product) => product.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;
            return (
              <tr
                key={`${TABLE_PREFIX}${row.loan_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={() => openModal(row)}
              >
                 {/* Account number */}
                <td className="text-center px-2 py-2 text-xs font-medium">{row.loan_ref_number || "ID"}</td>
                <td className="text-center px-2 py-2 text-xs font-medium">{row.account_number || "ID"}</td>
                {/* Member name */}
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={
                            matchedMember.avatar_url || `https://i.pravatar.cc/40?u=${matchedMember.id || matchedMember.l_name}`
                          }
                          alt={fullName}
                        />
                      </div>
                    </div>
                    <div className="truncate">{fullName || <span className="text-gray-400 italic">Not Provided</span>}</div>
                  </span>
                </td>

                {/* total amount due */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.total_amount_due?.toLocaleString() || "0"}
                </td>

                {/* Outstanding Balance */}
                <td className="px-2 py-2 text-center font-semibold text-success">
                  ₱ {row.outstanding_balance?.toLocaleString() || "0"}
                </td>

                {/*  Total paid */}
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
                <td className="px-2 py-2 text-center">{row.status}</td>
              </tr>
            );
          }}
        />

      </div>

      
    </div>
  )
}

export default LoanAccounts
