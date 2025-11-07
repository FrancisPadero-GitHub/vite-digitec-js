import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
function FilterToolbar({
  searchTerm,
  onSearchChange,
  dropdowns = [],
  isFilterPending = false,
  onReset,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <label className="input input-bordered flex items-center bg-base-100 w-[25vh]">
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
        </label>
      )}

      {dropdowns.map((dropdown, idx) => (
        <select
          aria-label={dropdown.label}         // satisfy the accessibility requirements 
          id={`dropdown-${idx}`}              // satisfy the accessibility requirements 
          name={dropdown.value || idx}        // satisfy the accessibility requirements 
          key={idx}
          className={`select select-bordered ${dropdown.className ?? "w-[15vh]"}`}
          value={dropdown.value}
          onChange={(e) => dropdown.onChange(e.target.value)}
        >
          <option value="">{dropdown.label}</option>
          {dropdown.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

      ))}
       
      {onReset && (
        <button
          type="button"
          title="Clear Filter"
          className="btn btn-ghost btn-square btn-sm text-error hover:bg-warning/10" 
          onClick={onReset}
        >
          <FilterAltOffOutlinedIcon />
        </button>
      )}
       
      {/* For the useTransition filtering state pending MIGHT JITTER THOUGH*/}
      {isFilterPending && (
        <span className="loading loading-spinner loading-xs text-primary"></span>
      )}
    </div>
  );
}

export default FilterToolbar;