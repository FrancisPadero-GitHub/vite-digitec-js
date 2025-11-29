import PropTypes from 'prop-types';

/**
 * DateFilterReports
 * Reusable year/month filter used by reports. Keeps markup and styling
 * consistent across pages.
 *
 * Props:
 * - selectedYear (string) - currently selected year (or "all")
 * - selectedMonth (string) - currently selected month (or "all")
 * - onYearChange (fn) - handler called with new year value
 * - onMonthChange (fn) - handler called with new month value
 * - yearOptions (array) - array of {label, value} to show as years
 * - months (array) - array of {label, value} to show as months
 * - onClear (fn) - optional clear callback
 */

export default function DateFilterReports({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  yearOptions = [],
  months = [],
  onClear,
}) {
  return (
    <div className="card-body p-4">
      <div className="flex items-center gap-4 flex-nowrap w-full">
        {/* Year Filter (inline) */}
        <div className="form-control w-auto">
          <label htmlFor="year-filter" className="label py-1 mb-0">
            <span className="label-text font-semibold text-base-content">Year</span>
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => onYearChange?.(e.target.value)}
            className="select select-bordered select-sm min-w-[120px]"
          >
            <option value="all">All Years</option>
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>{year.label}</option>
            ))}
          </select>
        </div>

        {/* Month Filter (inline) */}
        <div className="form-control w-auto">
          <label htmlFor="month-filter" className="label py-1 mb-0">
            <span className="label-text font-semibold text-base-content">Month</span>
          </label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => onMonthChange?.(e.target.value)}
            className="select select-bordered select-sm min-w-[120px]"
          >
            <option value="all">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {/* Clear Button (inline) */}
        {(selectedYear !== 'all' || selectedMonth !== 'all') && (
          <div className="form-control w-auto self-end ml-auto">
            <button
              onClick={() => onClear?.()}
              className="btn btn-primary btn-sm sm:btn-md w-auto gap-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

DateFilterReports.propTypes = {
  selectedYear: PropTypes.string.isRequired,
  selectedMonth: PropTypes.string.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  yearOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),  
  months: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  onClear: PropTypes.func,
};