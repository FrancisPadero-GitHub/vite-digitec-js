import { useState } from "react";

// fetch hooks
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";

// components
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from "../../constants/Color";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";


function MemberCoopShareCapital() {
  // useQuery hook to fetch member's coop contributions
  const { data: coopData, isLoading, error, isError } = useFetchCoop({ useLoggedInMember: true });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250); 

  const TABLE_PREFIX = "SCC"; // unique ID prefix
  const coopRaw = coopData?.data || [];

  const coop = coopRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.coop_contri_id}`;

    // Match search (id)
    const matchesSearch =
      debouncedSearch === "" ||
      generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

    // Match filters
    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter == "" || row.payment_method == paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
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

    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesYear && matchesMonth;
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
    paymentMethodFilter ? `${paymentMethodFilter}` : null,
    yearFilter ? `${yearFilter}` : null,
    monthFilter ? `${monthFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all contributions";


  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setPaymentMethodFilter("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
  }

  return (
    <div className="m-3 mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
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
                  { label: "Initial", value: "Initial" },
                  { label: "Monthly", value: "Monthly" },
                ],
              },
              {
                label: "Method",
                value: paymentMethodFilter,
                onChange: setPaymentMethodFilter,
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
                options: yearOptions
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
          title="My Share Capital / Coop Contributions"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Ref No.", "Amount", "Category", "Date", "Method"]}
          filterActive={activeFiltersText !== "Showing all contributions"}
          data={coop}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.coop_contri_id || "Not Found";
            const amount = row?.amount || 0;
            const paymentCategory = row?.category;
            const contributionDate = row?.contribution_date 
              ? new Date(row.contribution_date).toLocaleDateString() 
              : "Not Found";
            const paymentMethod = row?.payment_method || "Not Found";

            return (
              <tr key={id} className="text-center hover:bg-base-200/50">
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>
              
                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>

                {/* Payment Category */}
                <td>
                  {paymentCategory ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[paymentCategory]}`}>
                      {paymentCategory}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Found</span>
                  )}
                </td>

                {/* Contribution Date */}
                <td>
                  {contributionDate}
                </td>

                {/* Payment Method */}
                <td>
                  {paymentMethod ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                      {paymentMethod}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Found</span>
                  )}
                </td>
              </tr>
            )
          }}
        />
      </div>
  );
}

export default MemberCoopShareCapital
