import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";

// fetch hooks
import { useFetchMemberDetails } from "../../backend/hooks/member/useFetchMemberDetails";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";

// icons 
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import HandshakeIcon from "@mui/icons-material/Handshake";
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// components
import FinanceTab from "./components/FinanceTab";

// constants
import {
  CLUB_CATEGORY_COLORS,
  PAYMENT_METHOD_COLORS,
  CAPITAL_CATEGORY_COLORS,
} from "../../constants/Color";
const catGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTVsM3VoOHU1YWpqMjM0ajJ3bTBsODVxbnJsZDIzdTRyajBrazZ0MyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/qZgHBlenHa1zKqy6Zn/giphy.gif"



function MemberProfile() {

  const navigate = useNavigate();
  const { memberId } = useParams();
  const parsedId = Number(memberId);

  const [page, setPage] = useState(1);
  const limit = 2; // or 20 — depends on your UI preference
  
  // page limit somehow is messing up the calculation below not accountng all the transactions but only the 
  // rows that is covered on the limiter
  const { data, isLoading, isError, error } = useFetchMemberDetails({
    memberId: parsedId,
  });

  const memberInfo = data?.memberInfo || {};
  const clubFunds = data?.clubFunds?.data || [];
  const coopContributions = data?.coopContributions?.data || [];
  const loanAccount = data?.loanAcc?.data || [];

  const accountNo = memberInfo?.account_number
  const { data: loanAccView } = useFetchLoanAccView({ accountNumber: accountNo });    // loan acc view to view outstanding balance realtime
  const loanAccViewRaw = loanAccView?.data || [];

  const mergedLoanAccounts = loanAccount.map(baseRow => {
    const viewRow = loanAccViewRaw.find(v => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow, // all base table fields
      total_paid: viewRow?.total_paid || 0,
      outstanding_balance: viewRow?.outstanding_balance || 0,
    };
  });

  // console.log("TEST", mergedLoanAccounts )

  const activeLoans = mergedLoanAccounts?.filter(
    (row) => row.account_number === accountNo && row.status === "ONGOING"
  );

  // Past (Closed) loans — could be multiple
  const pastLoans = loanAccount?.filter(
    (row) => row.applicant_id === parsedId && row.status === "CLOSED"
  );


  // Full name display
  const displayName = `${memberInfo?.f_name ?? ""} ${memberInfo?.m_name ?? ""} ${memberInfo?.l_name ?? ""}`.trim();

  // Calculate total share capital
  const totalShareCapital = coopContributions.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // Calculate membership duration
  const calculateMembershipMonths = (joined_date) => {
    if (!joined_date) return 0;
    const joined = new Date(joined_date);
    const now = new Date();
    const years = now.getFullYear() - joined.getFullYear();
    const months = now.getMonth() - joined.getMonth();
    return years * 12 + months;
  };

  const membershipMonths = calculateMembershipMonths(memberInfo?.joined_date);

  // Calculate member's age based on birthday
  const birthday = new Date(memberInfo?.birthday);
  const today = new Date();

  let memberAge = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  const dayDiff = today.getDate() - birthday.getDate();

  // if birthday did not occur yet for the year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    memberAge--;
  }



  const topInfo = [
    { label: "Account No.", value: memberInfo?.account_number || "—" },
    {
      label: "Share Capital",
      value: `₱${totalShareCapital.toLocaleString()}`,
    },
    { label: "Membership", value: `${membershipMonths} mos` },
  ];

  const personalInfo = [
    { name: "member_id", label: "Member ID" },
    { name: "displayName", label: "Member Name" },
    { name: "email", label: "Email" },
    { name: "contact_number", label: "Contact Number" },
    { name: "birthday", label: "Birthday" },
    { name: "place_of_birth", label: "Place of Birth" },
    { name: "block_no", label: "Block / Street" },
    { name: "barangay", label: "Barangay" },
    { name: "city_municipality", label: "City / Municipality" },
    { name: "province", label: "Province" },
    { name: "zip_code", label: "ZIP Code" },
    { name: "civil_status", label: "Civil Status" },
    { name: "spouse_name", label: "Spouse Name", optional: true },
    { name: "number_of_children", label: "Number of Children", optional: true },
    { name: "office_name", label: "Office Name" },
    { name: "title_and_position", label: "Title / Position" },
    { name: "office_contact_number", label: "Office Contact Number" },
    { name: "office_address", label: "Office Address" },
  ];

  const eligibilityInfo = [
     {
      label: "Tenure",
      value: `${membershipMonths} months`,
      passed: membershipMonths >= 12,
      rule: "12 months of membership",
    },
    {
      label: "Age",
      value: `${memberAge} years old`,
      passed: memberAge >= 18,
      rule: "Must be at least 18 years old",
    },
    {
      label: "Share Capital",
      value: `₱${totalShareCapital.toLocaleString()}`,
      passed: totalShareCapital > 5000,
      rule: "₱5,000 share capital required",
    },
  ]
  
  // ----------- LOADING STATE -----------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">Loading Member Profile…</h1>
          <p className="text-gray-600">Fetching all member details. Please wait.</p>
        </div>
      </div>
    );
  }

  // ----------- ERROR STATE -----------
  if (isError) {
    let title = "An Error Occurred";
    let message = error.message || "Unexpected error happened.";

    switch (error.code) {
      case "NO_MEMBER_FOUND":
        title = "Member Not Found";
        message =
          "No member exists with that account number. Please navigate from a valid member link.";
        break;
      case "DB_ERROR":
        title = "Database Error";
        message = "There was a problem retrieving member information.";
        break;
      case "CLUB_FUNDS_ERROR":
        title = "Club Funds Error";
        message = "Unable to load club fund contributions.";
        break;
      case "COOP_CONTRI_ERROR":
        title = "Share Capital Error";
        message = "Unable to load share capital contributions.";
        break;
      case "LOAN_ACC_ERROR":
        title = "Share Capital Error";
        message = "Unable to load loan account information.";
        break;
    }

    return (
      <div className="p-8 text-center">
        <div className="inline-block rounded-xl bg-red-50 border border-red-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-red-600 mb-2">{title}</h1>
          <p className="text-gray-600">{message}</p>
          <button
            className="mt-4 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }



  // ----------- NO MEMBER STATE -----------
  if (!data?.memberInfo) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block rounded-xl bg-red-50 border border-red-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-red-600 mb-2">
            Member Not Found
          </h1>
          <p className="text-gray-600">
            No member exists with that ID. Please navigate from a valid member
            link.
          </p>
          <button
            className="mt-4 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-2xl font-bold flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">
          Member Records
        </button>
        <span className="text-base-content">| Member Profile</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* MAIN DETAILS */}
          <section className="card bg-base-100 shadow">
            <div className="bg-primary text-primary-content text-center p-6 rounded-t">
              <div className="flex justify-center mb-2">
                <div className="relative w-28 h-28 mx-auto">
                  <img
                    src={memberInfo?.avatar_url || catGif}
                    alt="Profile Picture"
                    className="rounded-full ring-4 ring-base-200 w-full h-full object-cover"
                  />
                </div>
              </div>
              <h2 className="text-lg font-semibold">{displayName}</h2>
              <span className="badge badge-neutral">
                {memberInfo?.account_role}
              </span>
              <p className="text-sm mt-2">
                Member Since:{" "}
                {memberInfo?.joined_date
                  ? new Date(memberInfo.joined_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div className="card-body p-4 grid grid-cols-3 text-center">
              {topInfo.map((stat, i) => (
                <div key={i}>
                  <h3 className="text-lg font-bold">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="card-title text-primary">Loan Eligibility</h2>

                  {/* Eligibility rules */}
                  <div className="dropdown dropdown-hover dropdown-right">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-xs text-gray-400 hover:text-gray-500">
                      <InfoIcon fontSize="small"/>
                    </div>
                    <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 p-4 shadow bg-base-200 text-base-content">
                      <div className="card-body p-0">
                        <h3 className="font-semibold text-sm mb-2">Eligibility Requirements</h3>
                        <ul className="text-xs space-y-1.5">
                          {eligibilityInfo.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item.rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligible/Ineligible badge */}
                {eligibilityInfo.every(item => item.passed) ? (
                  <span className="badge badge-success gap-2">
                    <CheckCircleIcon sx={{ fontSize: 16 }} />Eligible
                  </span>
                  ) : (
                    <span className="badge badge-error gap-2">
                      <CancelIcon sx={{ fontSize: 16 }} />Not Eligible
                    </span>
                )}
              </div>

              {/* Member's loan elibility info */}
              <div className="space-y-3">
                {eligibilityInfo.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`${item.passed ? 'text-success' : 'text-error'}`}>
                      {item.passed ? (
                        <CheckCircleIcon fontSize="small"/>
                      ) : (
                        <CancelIcon fontSize="small"/>
                      )}
                    </div>
                    <div className="flex-1 flex justify-between items-center gap-2">
                      <span className="font-medium text-sm">{item.label}:</span>
                      <p className={`text-sm font-semibold whitespace-nowrap ${item.passed ? 'text-success' : 'text-error'}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>


          {/* PERSONAL DETAILS */}
          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-start items-center mb-4">
                <h2 className="card-title text-primary">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {personalInfo.map(({ name, label, optional }) => {
                  if (optional) return null;
                  return (
                    <div key={name}>
                      <p className="text-xs text-gray-500 uppercase">{label}</p>
                      <p className="font-medium">
                        {name === "displayName"
                          ? displayName
                          : memberInfo?.[name] || "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <section className="md:col-span-2 space-y-6">
          <div className="tabs tabs-lift">
            {/* SHARE CAPITAL TAB */}
            <FinanceTab
              label="Share Capital"
              icon={<AccountBalanceIcon fontSize="small" className="mr-2" />}
              headers={["Ref No.", "Amount", "Payment Type", "Date", "Remarks"]}
              data={coopContributions}
              page={page}
              total={data?.coopContributions?.count || 0}
              limit={limit}
              setPage={setPage}
              isDefault={true}
              renderRow={(entry) => (
                <tr key={entry.coop_contri_id} className="text-center">
                  <td className="text-info font-medium">
                    SCC_{entry.coop_contri_id}
                  </td>
                  <td className="font-semibold text-success">
                    ₱{entry.amount.toLocaleString()}
                  </td>
                  <td>
                    {entry.category ? (
                      <span
                        className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[entry.category]}`}
                      >
                        {entry.category}
                      </span>
                    ) : (
                      <span className="badge font-semibold badge-error">
                        Not Provided
                      </span>
                    )}
                  </td>
                  <td>{entry.contribution_date}</td>
                  <td>{entry.remarks}</td>
                </tr>
              )}
            />

            {/* CLUB FUNDS TAB */}
            <FinanceTab
              label="Club Funds"
              icon={<SavingsIcon fontSize="small" className="mr-2" />}
              headers={["Ref No.", "Amount", "Category", "Method", "Date", "Period Covered", "Remarks"]}
              
              data={clubFunds}
              page={page}
              total={data?.clubFunds?.count || 0}
              limit={limit}
              setPage={setPage}

              renderRow={(entry) => (
                <tr key={entry.contribution_id} className="text-center">
                  <td className="text-info font-medium">
                    CFC_{entry.contribution_id}
                  </td>
                  <td className="font-semibold text-success">
                    ₱{entry.amount.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`font-semibold ${CLUB_CATEGORY_COLORS[entry.category]}`}
                    >
                      {entry.category || "Not Provided"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[entry.payment_method]}`}
                    >
                      {entry.payment_method || "Not Provided"}
                    </span>
                  </td>
                  <td className="text-xs">{entry.payment_date}</td>
                  <td className="text-center px-4 py-2 w-50">
                    {entry.period_start && entry.period_end ? (
                      <span className="px-3 py-1 text-xs">
                        {new Date(entry.period_start).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}{" "}
                        -{" "}
                        {new Date(entry.period_end).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    ) : (
                      <span className="italic">Not Provided</span>
                    )}
                  </td>
                  <td>{entry.remarks}</td>
                </tr>
              )}
            />

            {/* ONGOING LOANS */}
            <FinanceTab
              label="Ongoing Loans"
              icon={<HandshakeIcon className="mr-2" />}
              headers={[
                "Loan Ref No.",
                "Status",
                "Principal",
                "Total Amount Due",
                "Outstanding Balance",
                "Total Paid",
                // "Release Date",
                // "Maturity Date",
              ]}
              data={activeLoans}
              page={page}
              total={activeLoans?.length || 0}
              limit={limit}
              setPage={setPage}

              renderRow={(loan) => (
                <tr key={loan.loan_id} className="text-center">
                  <td className="font-medium text-info text-xs">{loan.loan_ref_number}</td>
                  <td>
                    <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {loan.status}
                    </span>
                  </td>
                  <td>₱{Number(loan.principal || 0).toLocaleString()}</td>
                  <td>₱{Number(loan.total_amount_due || 0).toLocaleString()}</td>
                  <td>₱{Number(loan.outstanding_balance || 0).toLocaleString()}</td>
                  <td>₱{Number(loan.total_paid || 0).toLocaleString()}</td>
                  {/* <td>
                    {loan.release_date
                      ? dayjs(loan.release_date).format("MMM D, YYYY")
                      : "—"}
                  </td> */}
                  {/* <td>
                    {loan.maturity_date
                      ? dayjs(loan.maturity_date).format("MMM D, YYYY")
                      : "—"}
                  </td> */}
                </tr>
              )}
            />

            {/* PAST LOANS */}
            <FinanceTab
              label="Past Loans"
              icon={<HandshakeIcon className="mr-2" />}
              headers={[
                "Account No.",
                "Status",
                "Principal",
                "Outstanding Balance",
                "Release Date",
                "Maturity Date",
              ]}
              data={pastLoans}
              page={page}
              total={pastLoans?.length || 0}
              limit={limit}
              setPage={setPage}

              renderRow={(loan) => (
                <tr key={loan.loan_id} className="text-center">
                  <td className="font-medium text-info text-xs">{loan.account_number}</td>
                  <td>
                    <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                      {loan.status}
                    </span>
                  </td>
                  <td>₱{Number(loan.principal || 0).toLocaleString()}</td>
                  <td>₱{Number(loan.outstanding_balance || 0).toLocaleString()}</td>
                  <td>
                    {loan.release_date
                      ? dayjs(loan.release_date).format("MMM D, YYYY")
                      : "—"}
                  </td>
                  <td>
                    {loan.maturity_date
                      ? dayjs(loan.maturity_date).format("MMM D, YYYY")
                      : "—"}
                  </td>
                </tr>
              )}
            />

          </div>
        </section>
      </div>
    </div>
  );
}

export default MemberProfile;

