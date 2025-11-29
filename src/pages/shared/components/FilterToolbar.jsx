import { useState } from "react";
import PropTypes from 'prop-types';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

function FilterToolbar({
  searchTerm,
  onSearchChange,
  dropdowns = [],
  isFilterPending = false,
  onReset,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((s) => !s);
  const hasActiveFilters =
    searchTerm || dropdowns.some((d) => d.value && d.value !== "");

  return (
    <div>
      <div className="flex flex-row lg:items-center gap-5 w-full">
        {/* Search bar and clear button - fixed width on large screens */}
        {onSearchChange && onReset && (
          <div className="flex items-center gap-2 mb-2 w-full sm:w-[250px] md:w-[300px] lg:w-[400px]">
            <label className="input input-bordered flex items-center bg-base-100 w-full lg:self-top">
              <SearchIcon className="text-base-content/50" />
              <input
                id="search_filter"
                name="search_filter"
                type="text"
                placeholder="Search..."
                className="grow"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {isFilterPending && (
                <span className="loading loading-spinner loading-xs text-primary"></span>
              )}
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                title="Clear Filter"
                className="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10"
                onClick={onReset}
              >
                <ClearIcon />
              </button>
            )}
          </div>
        )}

        {/* Expand/Collapse button - always visible */}
        {dropdowns.length > 0 && (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls="filterDropdowns"
            className="underline underline-offset-2 text-sm text-primary self-center lg:self-center cursor-pointer"
            onClick={toggleExpanded}
          >
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </button>
        )}
      </div>

      {/* Dropdowns container */}
      <div
        id="filterDropdowns"
        className={`${isExpanded ? "grid grid-cols-2 gap-3 md:flex md:flex-row md:flex-wrap md:gap-3" : "hidden"} w-full lg:flex-1`}
      >
        {dropdowns.map((dropdown, idx) => (
          <select
            aria-label={dropdown.label}
            id={`dropdown-${idx}`}
            name={dropdown.value || idx}
            key={idx}
            className={`select select-bordered ${dropdown.className ?? "w-full md:w-[150px]"}`}
            value={dropdown.value}
            onChange={(e) => dropdown.onChange(e.target.value)}
          >
            <option value="">{dropdown.label}</option>
            {dropdown.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}

export default FilterToolbar;

FilterToolbar.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  dropdowns: PropTypes.array,
  isFilterPending: PropTypes.bool,
  onReset: PropTypes.func,
};
