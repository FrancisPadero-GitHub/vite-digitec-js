import React from 'react';

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
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
            Year:
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => onYearChange?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Years</option>
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>{year.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">
            Month:
          </label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => onMonthChange?.(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {(selectedYear !== 'all' || selectedMonth !== 'all') && (
          <button
            onClick={() => onClear?.()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
