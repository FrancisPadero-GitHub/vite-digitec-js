import { useState } from "react";
import { useFetchCoopByMember } from "../members/hooks/useFetchCoopByMember";
import MainDataTable from "../treasurer/components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from "../../constants/Color";

function MemberShareCapital() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // determines how many rows to render per page

  // useQuery hook to fetch member's coop contributions
  const { data: coopData, isLoading, isError, error } = useFetchCoopByMember(page, limit);

  // Get total count and raw data
  const total = coopData?.count || 0;
  const coopRaw = coopData?.data || [];

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [categoryFilter, setCategoryFilter] = useState(""); // Payment category filter
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(""); //payment method filter
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "SCC"; // unique ID prefix
  const coop = coopRaw.filter((row) => {
    // Generate SCC_xxx ID
    const generatedId = `${TABLE_PREFIX}_${row.coop_contri_id}`;

    // Match search (remarks, or generated ID)
    const matchesSearch =
      searchTerm === "" ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    // Match filters
    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter == "" || row.payment_method == paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth = monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesYear && matchesMonth;
  });

  if (isLoading) return <div>Loading Coop Contributions...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
     <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold" >My Share Capital / Coop Contributions</h1>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Initial", value: "Initial" },
                { label: "GCash", value: "Monthly" },
              ],
            },
            {
              label: "Method",
              value: paymentMethodFilter,
              onChange: setPaymentMethodFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },
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
          headers={["Ref No.", "Amount", "Payment Category", "Date", "Payment Method"]}
          data={coop}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            return (
              <tr
                key={`${TABLE_PREFIX}${row.coop_contri_id}`}
                className={`transition-colors hover:bg-base-200/70`}
              >
                <td className="px-4 py-2 text-center font-medium text-xs">SCC_{row.coop_contri_id}</td>
                <td className="px-4 py-4 font-semibold text-success text-center">₱ {row.amount?.toLocaleString() || "0"}</td>
                <td className="px-4 py-2 text-center">
                  {row.category ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row.category]}`}>
                      {row.category} 
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.contribution_date
                    ? new Date(row.contribution_date).toLocaleDateString()
                    : <span className="text-gray-400 italic">Not Provided</span>}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                      {row.payment_method} 
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
  );
}

export default MemberShareCapital
