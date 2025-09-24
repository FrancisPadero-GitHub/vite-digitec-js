import SearchIcon from "@mui/icons-material/Search";
function FilterToolbar({
  searchTerm,
  onSearchChange,
  dropdowns = [],
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <label className="input input-bordered flex items-center bg-base-100 md:w-64">
          <SearchIcon className="text-base-content/50" />
          <input
            type="text"
            placeholder="Ref No or Name search..."
            className="grow"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      )}

      {dropdowns.map((dropdown, idx) => (
        <select
          key={idx}
          className={`select select-bordered ${dropdown.className ?? "w-40"}`}
          value={dropdown.value}
          onChange={(e) => dropdown.onChange(e.target.value)}
        >
          {dropdown.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}

export default FilterToolbar;