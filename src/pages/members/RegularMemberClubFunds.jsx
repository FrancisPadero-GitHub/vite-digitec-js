import { useState } from "react";
import { useFetchClubFundsByMember } from "../members/hooks/useFetchClubFundsByMember";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";
import { CLUB_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from '../../constants/Color';

function RegularMemberClubFunds() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // determines how many rows to render per page

  // useQuery hook to fetch member's club fund contributions
  const { data: clubFundsData, isLoading, isError, error } = useFetchClubFundsByMember(page, limit);

  // Get total count and raw data
  const total = clubFundsData?.count || 0;
  const clubFundsRaw = clubFundsData?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [categoryFilter, setCategoryFilter] = useState(""); // Payment category filter
  const [methodFilter, setmethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "CFC"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const clubFunds = clubFundsRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.contribution_id}`;

    const matchesSearch =
      searchTerm === "" ||
      row.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase()); // <-- ID match

    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;
    const matchesMethod = methodFilter === "" || row.payment_method === methodFilter;

    const date = row.payment_date ? new Date(row.payment_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesCategory && matchesYear && matchesMonth && matchesMethod;
  });

  if (isLoading) return <div>Loading Club Funds...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">My Club Fund Contributions</h1>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Method",
              value: methodFilter,
              onChange: setmethodFilter,
              options: [
                { label: "All", value: "" },
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },

              ],
            },
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "All", value: "" },
                { label: "Monthly Dues", value: "Monthly Dues" },
                { label: "Activites", value: "Activities" },
                { label: "Alalayang Agila", value: "Alalayang Agila" },
                { label: "Community Service", value: "Community Service" },
                { label: "Others", value: "Others" },
              ],
            },
            {
              label: "Year",
              value: yearFilter,
              onChange: setYearFilter,
              options: [
                { label: "All", value: "" },
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
                { label: "2022", value: "2022" },
                { label: "2021", value: "2021" },
                { label: "2020", value: "2020" },
              ],
            },
            {
              label: "Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "All", value: "" },
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
          headers={["Ref No.", "Amount", "Category", "Date", "Method", "Period Covered"]}
          data={clubFunds}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            return (
              <tr
                key={`${TABLE_PREFIX}_${row.contribution_id}`}
                className="transition-colors hover:bg-base-200/70"
              >
                <td className="px-4 py-2 text-center font-medium">{TABLE_PREFIX}_{row.contribution_id}</td>
                {/* Amount */}
                <td className="px-4 py-2 font-semibold text-success">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>

                {/* Category */}
                <td className='px-4 py-2'>
                  <span className={` font-semibold ${CLUB_CATEGORY_COLORS[row.category]}`}>
                    {row.category || "Not Provided"}
                  </span>
                </td>

                {/* Payment Date */}
                <td className="px-4 py-2">
                  {row.payment_date ? (
                    <span>{new Date(row.payment_date).toLocaleDateString()}</span>
                  ) : (
                    <span className="italic">Not Provided</span>
                  )}
                </td>

                {/* Payment Method */}
                <td className='px-4 py-2' >
                  {row.payment_date ? 
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                      {row.payment_method}
                    </span>
                    : 
                    <span className="badge font-semibold badge-error">Not Provided</span>
                }
                </td>

                {/* Period Covered */}
                <td className="text-center px-4 py-2 w-50">
                  {row.period_start && row.period_end ? (
                    <span className="px-3 py-1 text-xs">
                      {new Date(row.period_start).toLocaleDateString("en-US", {
                        month: "long",   // "January"
                        day: "numeric",
                        year: "numeric",
                      })} - {" "}
                      {new Date(row.period_end).toLocaleDateString("en-US", {
                        month: "long",   // "January"
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="italic">Not Provided</span>
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

export default RegularMemberClubFunds
