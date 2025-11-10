import { useState } from "react";

// fetch hooks
import { useFetchClubFunds } from "../../backend/hooks/shared/useFetchClubFunds"

// components
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { CLUB_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from '../../constants/Color';

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";


function MemberClubFunds() {
  // useQuery hook to fetch member's club fund contributions
  const { data: clubFundData, isLoading, isError, error } = useFetchClubFunds({ useLoggedInMember: true });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250); 

  const TABLE_PREFIX = "CFC"; // unique ID prefix
  const clubFundsRaw = clubFundData?.data || [];

  const clubFunds = clubFundsRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.contribution_id}`;

    // Match search (id, category)
    const matchesSearch =
      debouncedSearch === "" ||
      row.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      generatedId.toLowerCase().includes(debouncedSearch.toLowerCase()); // <-- ID match

    // Match filters
    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;
    const matchesMethod = methodFilter === "" || row.payment_method === methodFilter;

    const date = row.payment_date ? new Date(row.payment_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    
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

    return matchesSearch && matchesCategory && matchesYear && matchesMonth && matchesMethod;
  });

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
    categoryFilter ? `${categoryFilter}` : null,
    methodFilter ? `${methodFilter}` : null,
    yearFilter ? `${yearFilter}` : null,
    monthFilter ? `${monthFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all contributions";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setMethodFilter("");
    setYearFilter("");
    setMonthFilter("");
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "Category",
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { label: "Monthly Dues", value: "Monthly Dues" },
                  { label: "Activites", value: "Activities" },
                  { label: "Alalayang Agila", value: "Alalayang Agila" },
                  { label: "Community Service", value: "Community Service" },
                  { label: "Others", value: "Others" },
                ],
              },
              {
                label: "Method",
                value: methodFilter,
                onChange: setMethodFilter,
                options: [
                  { label: "Cash", value: "Cash" },
                  { label: "GCash", value: "GCash" },
                  { label: "Bank", value: "Bank" },

                ],
              },
              {
                label: "Year",
                value: yearFilter,
                onChange: setYearFilter,
                options: yearOptions,
              },
              {
                label: "Month",
                value: monthFilter,
                onChange: setMonthFilter,
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
          title={"My Club Fund Contributions"}
          subtext={activeFiltersText}
          filterActive={activeFiltersText !== "Showing all contributions"}
          showLinkPath={false}
          headers={["Ref No.", "Amount", "Category", "Date", "Method"]}
          data={clubFunds}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.contribution_id || "Not Found";
            const amount = row?.amount || 0;
            const category = row?.category;
            const paymentDate = row?.payment_date
              ? new Date(row.payment_date).toLocaleDateString()
              : "Not Found";
            const paymentMethod = row?.payment_method;

            return (
              <tr key={id} className="text-center hover:bg-base-200/50">
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}{id}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>

                {/* Payment Category */}
                <td>
                  {category ? (
                    <span className={`font-semibold ${CLUB_CATEGORY_COLORS[category]}`}>
                      {category}
                    </span>
                  ) : (
                    <span className="font-semibold">Not Found</span>
                  )}
                </td>

                {/* Contribution Date */}
                <td>
                  {paymentDate}
                </td>

                {/* Payment Method */}
                <td>
                  {paymentMethod ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                      {paymentMethod}
                    </span>
                  ) : (
                    <span className="font-semibold">Not Found</span>
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

export default MemberClubFunds
