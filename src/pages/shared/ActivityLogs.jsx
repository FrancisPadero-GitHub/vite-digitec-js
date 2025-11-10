import { useState, useTransition, useMemo } from "react";
import { useFetchActivityLogs } from "../../backend/hooks/shared/useFetchActivityLogs";
import DataTableV2 from "./components/DataTableV2.jsx";
import FilterToolbar from "./components/FilterToolbar.jsx";
import { ACTIVITY_LOGS_TYPE_COLORS } from "../../constants/Color.js";
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce.js";

export default function ActivityLogs() {
  const { data: logs, isLoading, isError, error } = useFetchActivityLogs({});

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [timeRangeFilter, setTimeRangeFilter] = useState("")

  // add useTransition for smoother filtering
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  };
  const handleTypeChange = (value) => {
    startTransition(() => {
      setTypeFilter(value);
    });
  };
  const handleTimeRangeChange = (value) => {
    startTransition(() => {
      setTimeRangeFilter(value);
    })
  }

  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "LOG";
  const logsData = useMemo(() => {
    const logsRaw = logs?.data || [];

    // calculation to get cutofff time based on selected time range filter
    let cutoffTime = null;
    if (timeRangeFilter) {
      const now = Date.now();
      switch(timeRangeFilter) {
        case "1h":
          cutoffTime = now - (60 * 60 * 1000);
          break;
        case "24h":
          cutoffTime = now - (24 * 60 * 60 * 1000);
          break;
        case "7d":
          cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    return logsRaw.filter((row) => {
      const generatedId = `${TABLE_PREFIX}_${row?.log_id || ""}`;
      const matchesSearch =
        debouncedSearch === "" ||
        (row.full_name && row.full_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (row.type && row.type.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (row.action && row.action.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = typeFilter === "" || row.type === typeFilter;

      const matchesTimeRange = cutoffTime === null || (row.timestamp && Date.parse(row.timestamp) >= cutoffTime);

      return matchesSearch && matchesType && matchesTimeRange;
    })
  }, [logs, debouncedSearch, typeFilter, timeRangeFilter])

  // for data table subtext when filters are active
  const activeFiltersText = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : null,
    typeFilter ? `${typeFilter}` : null,
    timeRangeFilter? `${timeRangeFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all logs";

  // clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setTimeRangeFilter("");
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        {/* Dropdown toolbar */}
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          isFilterPending={isPending}
          onReset={handleClearFilters}
          dropdowns={[
            {
              label: "All Types",
              value: typeFilter,
              onChange: handleTypeChange,
              options: [
                {label: "CREATE", value: "CREATE"},
                {label: "UPDATE", value: "UPDATE"},
                {label: "DELETE", value: "DELETE"},
              ]
            },
                        {
              label: "All Time",
              value: timeRangeFilter,
              onChange: handleTimeRangeChange,
              options: [
                {label: "1 Hour", value: "1h"},
                {label: "24 Hours", value: "24h"},
                {label: "7 Days", value: "7d"},
              ]
            }
          ]}
        />
        </div>

        <DataTableV2
          title="Activity Logs"
          subtext={activeFiltersText}
          headers={["Ref No.", "Date and Time", "Action Taken By", "Type", "Action"]}
          filterActive={activeFiltersText !== "Showing all logs"}
          data={logsData}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.log_id || "Not found";
            const timestamp = row?.timestamp ? new Date(row.timestamp).toLocaleString() : "Not found";
            const fullName = row?.full_name || "Not found";
            const accountRole = row?.account_role || "Not found";
            const type = row?.type || "Not found";
            const action = row?.action || "Not found";

            return (
              <tr key={id} className="hover:bg-base-200/50">
                {/* Ref No. */}
                <td className="text-center font-medium text-xs w-[12%]">{TABLE_PREFIX}_{id}</td>

                {/* Date and Time */}
                <td className="text-center font-medium w-[20%]">{timestamp}</td>

                {/* Action Taken By */}
                <td className="w-[10%]">
                  <div className="flex flex-col items-left">
                    <div className="font-medium">{fullName}</div>
                    <span className="text-gray-600">{accountRole}</span>
                  </div>
                </td>

                {/* Type */}
                <td className="text-center font-semibold w-[15%]">
                  <span className={`badge badge-soft ${ACTIVITY_LOGS_TYPE_COLORS[type] || 'badge-error'}`}>
                    {type}
                  </span>
                </td>

                {/* Action */}
                <td className="text-left w-[45%]">
                  {action}
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}