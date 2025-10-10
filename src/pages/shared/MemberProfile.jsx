import { useParams, useNavigate } from "react-router-dom";
import { useFetchMemberDetails } from "./hooks/useFetchMemberDetails";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import HandshakeIcon from "@mui/icons-material/Handshake";
import FinanceTab from "./components/MemberFinanceTabs";
import { CLUB_CATEGORY_COLORS, PAYMENT_METHOD_COLORS, CAPITAL_CATEGORY_COLORS } from "../../constants/Color";

function MemberProfile() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const parsedId = Number(memberId); // convert string ID to number
  const { data, isLoading, isError, error } = useFetchMemberDetails(parsedId);
  const { memberInfo, clubFunds, coopContributions } = data || {};

  // Helpers 
  const displayName = `${memberInfo?.f_name ?? ""} ${memberInfo?.m_name ?? ""} ${memberInfo?.l_name ?? ""}`.trim(); //for full name
  
  const totalShareCapital = coopContributions?.reduce((sum, item) => sum + (item.amount || 0), 0); //sum of coop contributions

  // calculate membership duration in months
  const calculateMembershipMonths = (joinedDate) => {
    if (!joinedDate) return 0;
    const joined = new Date(joinedDate);
    const now = new Date();
    const years = now.getFullYear() - joined.getFullYear();
    const months = now.getMonth() - joined.getMonth();
    return years * 12 + months;
  };
  const membershipMonths = calculateMembershipMonths(memberInfo?.joined_date);

  // mappings for top info and personal info sections in left column
  const topInfo = [
    { label: "ID No.", value: memberInfo?.member_id || "—" },
    { label: "Share Capital", value: `₱${totalShareCapital?.toLocaleString()}` },
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

  if (isLoading) return <div>Loading user data...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  // Handle case where member id does not exist
  if (!data?.memberInfo) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block rounded-xl bg-red-50 border border-red-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Member Not Found</h1>
          <p className="text-gray-600">No member exists with that ID. Please navigate from a valid member link.</p>
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
    <>
        {/* BREADCRUMBS */}
        <div className="text-2xl font-bold flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-primary hover:underline">Member Records</button>›
            <span className="text-base-content">Member Profile</span>
        </div>

        {/* LEFT COLUMN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-6">
              {/* UPPER LEFT CARD; MAIN DETAILS */}
              <section className="card bg-base-100 shadow">
                <div className="bg-primary text-primary-content text-center p-6 rounded-t">
                  <div className="flex justify-center mb-2">
                    <div className="relative w-28 h-28 mx-auto">
                      <img src={data?.memberInfo?.avatar_url} className="rounded-full ring-4 ring-base-200 w-full h-full object-cover"/>
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold">{displayName}</h2>
                  <span className="badge badge-neutral">{memberInfo?.account_type}</span>
                  <p className="text-sm mt-2">
                     {/* change this to joined date later, right now joined_date in the db is all null. 
                        application_date is used in the meantime
                     */}
                    Member Since: {memberInfo?.application_date ? new Date(memberInfo.application_date).toLocaleDateString() : "N/A"}
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

              {/* LOWER LEFT CARD; MORE DETAILS */}
              <section className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title text-primary">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {personalInfo.map(({ name, label, optional }) => {
                      if (optional) return null;
                      return (
                        <div key={name}>
                          <p className="text-xs text-gray-500 uppercase">{label}</p>
                          <p className="font-medium">{name === "displayName" ? displayName : memberInfo?.[name] || "—"}</p>
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
                  headers={["Ref No.", "Amount", "Payment Type", "Date" , "Remarks"]}
                  data={coopContributions}
                  total={coopContributions?.length || 0}
                  page={1}
                  limit={10}
                  isDefault={true}
                  setPage={() => {}}
                  renderRow={(entry) => (
                    <tr key={entry.coop_contri_id} className="text-center">
                      <td className="text-info font-medium">SCC_{entry.coop_contri_id}</td>
                      <td className="font-semibold text-success">₱{entry.amount.toLocaleString()}</td>
                      <td>
                        {entry.category ? (
                          <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[entry.category]}`}>
                            {entry.category} 
                          </span>
                        ) : (
                          <span className="badge font-semibold badge-error">Not Provided</span>
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
                  total={clubFunds?.length || 0}
                  page={1}
                  limit={10}
                  setPage={() => {}}
                  renderRow={(entry) => (
                    <tr key={entry.contribution_id} className="text-center">
                      <td className="text-info font-medium">CFC_{entry.contribution_id}</td>
                      <td className="font-semibold text-success">₱{entry.amount.toLocaleString()}</td>
                      <td>
                        <span
                          className={` font-semibold ${CLUB_CATEGORY_COLORS[entry.category]}`}
                        >
                          {entry.category || "Not Provided"}
                        </span>
                      </td>
                      <td className="text-xs">{entry.payment_date}</td>
                      <td>
                        <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[entry.payment_method]}`}>
                          {entry.payment_method || "Not Provided"}
                        </span>
                      </td>
                      <td className="text-center px-4 py-2 w-50">
                        {entry.period_start && entry.period_end ? (
                          <span className="px-3 py-1 text-xs">
                            {new Date(entry.period_start).toLocaleDateString("en-US", {
                              month: "long",   // "January"
                              day: "numeric",
                              year: "numeric",
                            })} - {" "}
                            {new Date(entry.period_end).toLocaleDateString("en-US", {
                              month: "long",   // "January"
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="italic">Not Provided</span>
                        )}
                      </td>
                      <td>{entry.remarks}</td>
                    </tr>
                  )}
                />

                {/* LOANS TAB, EMPTY FOR NOW */}
                <FinanceTab
                  label="Loans"
                  icon={<HandshakeIcon className="mr-2" />}
                  headers={["Loan ID", "Amount", "Status", "Start Date", "End Date"]}
                  data={[]}
                  total={0}
                  page={1}
                  limit={10}
                  setPage={() => {}}
                  renderRow={() => null}
                />
              </div>
          </section>
        </div>
      </>
  );
}

export default MemberProfile;
