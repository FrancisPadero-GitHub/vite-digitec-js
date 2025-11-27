import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router';
import { useMemberRole } from '../../../backend/context/useMemberRole';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import { useFetchMonthlyDuesRecords } from '../../../backend/hooks/shared/useFetchMonthlyDuesRecords';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

function MonthlyDues() {
  const navigate = useNavigate();
  const { memberRole } = useMemberRole();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed (0 = January, 11 = December)

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(0); // January
  const [endMonth, setEndMonth] = useState(11); // December
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState('all');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const { data: monthlyDuesRecords, isLoading, isError, error } = useFetchMonthlyDuesRecords({
    year: selectedYear,
    accountNumber: selectedMember === 'all' ? null : selectedMember,
  });

  // Get unique members from the data
  const memberOptions = useMemo(() => {
    if (!monthlyDuesRecords || monthlyDuesRecords.length === 0) return [];
    const uniqueMembers = new Map();
    monthlyDuesRecords.forEach(record => {
      if (record.full_name && record.account_number) {
        uniqueMembers.set(record.account_number, {
          account_number: record.account_number,
          full_name: record.full_name
        });
      }
    });

    return Array.from(uniqueMembers.values()).sort((a, b) =>
      a.full_name.localeCompare(b.full_name)
    );
  }, [monthlyDuesRecords]);

  // Filter members based on search input
  const filteredMemberOptions = useMemo(() => {
    if (!memberSearch) return memberOptions;

    const searchLower = memberSearch.toLowerCase();
    return memberOptions.filter(member =>
      member.full_name.toLowerCase().includes(searchLower) ||
      member.account_number.toLowerCase().includes(searchLower)
    );
  }, [memberOptions, memberSearch]);

  // Get selected member display name
  const selectedMemberName = useMemo(() => {
    if (selectedMember === 'all') return 'All Members';
    const member = memberOptions.find(m => m.account_number === selectedMember);
    return member ? `${member.full_name} (${member.account_number})` : 'All Members';
  }, [selectedMember, memberOptions]);

  // Generate year options (last 5 years)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  // Get available months for "To" dropdown based on "From" selection
  const availableEndMonths = useMemo(() => {
    // Must be at least 1 month after startMonth (no same month selection)
    return MONTHS.filter((_, index) => index > startMonth);
  }, [startMonth]);

  // Get available months for "From" dropdown based on "To" selection
  const availableStartMonths = useMemo(() => {
    // Must be at least 1 month before endMonth
    return MONTHS.filter((_, index) => index < endMonth);
  }, [endMonth]);

  // Get filtered month range
  const filteredMonths = useMemo(() => {
    return MONTHS.slice(startMonth, endMonth + 1);
  }, [startMonth, endMonth]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedYear(currentYear);
    setStartMonth(0);
    setEndMonth(11);
    setSelectedMember('all');
    setMemberSearch('');
  };

  // Generate columns based on filtered months
  const columns = useMemo(() => [
    {
      accessorKey: 'member',
      header: 'Members',
      cell: info => <div className="font-medium text-base-content whitespace-nowrap">{info.getValue()}</div>,
      meta: { isSticky: true }
    },
    ...filteredMonths.map(month => ({
      accessorKey: month,
      header: month,
      cell: info => {
        const value = info.getValue();
        return (
          <div
            className={`px-3 py-2 rounded-md font-semibold text-center ${value === 'Paid'
              ? 'bg-green-200 text-green-800'
              : value === 'Missed'
                ? 'bg-red-200 text-red-800'
                : 'bg-gray-100 text-gray-400'
              }`}
          >
            {value || '—'}
          </div>
        );
      },
    })),
  ], [filteredMonths]);

  // Transform the data into monthly payment records
  const data = useMemo(() => {
    if (!monthlyDuesRecords || monthlyDuesRecords.length === 0) return [];

    // Group by member
    const memberMap = new Map();

    monthlyDuesRecords.forEach(record => {
      const memberName = record.full_name;
      const periodStart = new Date(record.period_start);
      const periodEnd = new Date(record.period_end);

      // Determine months covered by this payment record
      const startMonth = periodStart.getMonth();
      const endMonth = periodEnd.getMonth();

      if (!memberMap.has(memberName)) {
        // Initialize with empty strings for all the months
        const monthData = {}
        MONTHS.forEach(m => { monthData[m] = ''});

        memberMap.set(memberName, {
          member: memberName,
          ...monthData
        });
      }

      const memberData = memberMap.get(memberName);

      for (let monthIndex = startMonth; monthIndex <= endMonth; monthIndex++) {
        memberData[MONTHS[monthIndex]] = 'Paid';
      }
    });

    // Convert map to array and mark missed payments for past months
    const result = Array.from(memberMap.values()).map(memberData => {
      MONTHS.forEach((monthName, index) => {
        // Only mark as missed if:
        // 1. The month is in the selected year and has passed
        // 2. The month is within the selected range
        // 3. No payment was made
        const isCurrentYear = selectedYear === currentYear;
        const hasMonthPassed = isCurrentYear ? index < currentMonth : true;
        const isInRange = index >= startMonth && index <= endMonth;

        if (hasMonthPassed && isInRange && memberData[monthName] === '') {
          memberData[monthName] = 'Missed';
        }
      });

      return memberData;
    });

    // console.log('Final result:', result);
    return result;
  }, [monthlyDuesRecords, selectedYear, currentYear, currentMonth, startMonth, endMonth, selectedMember])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="m-3">
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Monthly Dues</h1>
        <button
          className="btn btn-neutral whitespace-nowrap"
          onClick={() => navigate(`/${memberRole}/club-funds`)}
        >
          Back
        </button>
      </div>

      {/* Filters Card */}
      <section className="border border-base-content/5 bg-base-100 rounded-2xl">
        <div className="p-4">
          <div className="flex items-end justify-between mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              {/* Member Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Member</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedMember === 'all' ? memberSearch : selectedMemberName}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                      if (selectedMember !== 'all') {
                        setSelectedMember('all');
                      }
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    placeholder="Search members..."
                    className="input input-bordered w-full"
                  />
                  {showMemberDropdown && (
                    <>
                      <div className="fixed inset-0 z-10"onClick={() => setShowMemberDropdown(false)}/>
                      <div className="absolute z-20 w-full mt-1 bg-base-100 border border-base-content/10 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div
                          onClick={() => {
                            setSelectedMember('all');
                            setMemberSearch('');
                            setShowMemberDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-content/10 font-medium"
                        >
                          All Members
                        </div>
                        {filteredMemberOptions.length > 0 ? (
                          filteredMemberOptions.map(member => (
                            <div
                              key={member.account_number}
                              onClick={() => {
                                setSelectedMember(member.account_number);
                                setMemberSearch('');
                                setShowMemberDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                            >
                              <div className="font-medium">{member.full_name}</div>
                              <div className="text-xs opacity-60">{member.account_number}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm opacity-60 italic">
                            No members found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Year Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Year</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="select select-bordered w-full"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Start Month Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">From Month</span>
                </label>
                <select
                  value={startMonth}
                  onChange={(e) => {
                    const newStart = Number(e.target.value);
                    setStartMonth(newStart);
                    if (newStart >= endMonth) {
                      setEndMonth(Math.min(newStart + 1, 11));
                    }
                  }}
                  className="select select-bordered w-full"
                >
                  {availableStartMonths.map((month) => {
                    const monthIndex = MONTHS.indexOf(month);
                    return (
                      <option key={month} value={monthIndex}>{month}</option>
                    );
                  })}
                </select>
              </div>

              {/* End Month Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">To Month</span>
                </label>
                <select
                  value={endMonth}
                  onChange={(e) => {
                    const newEnd = Number(e.target.value);
                    setEndMonth(newEnd);
                    if (newEnd <= startMonth) {
                      setStartMonth(Math.max(newEnd - 1, 0));
                    }
                  }}
                  className="select select-bordered w-full"
                >
                  {availableEndMonths.map((month) => {
                    const monthIndex = MONTHS.indexOf(month);
                    return (
                      <option key={month} value={monthIndex}>{month}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              type="button"
              title="Clear Filters"
              className="btn btn-ghost btn-circle text-error hover:bg-error/10 ml-4"
              onClick={handleResetFilters}
            >
              <FilterAltOffOutlinedIcon />
            </button>
          </div>
        </div>
      </section>

      {/* Monthly Table */}
      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden mt-6">
        <div className="bg-gradient-to-r from-blue-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Club Funds Monthly Payables Record ({selectedYear}) - {MONTHS[startMonth]} to {MONTHS[endMonth]}
          </h2>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] min-h-[20vh] relative">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transaction data...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-red-600">Error loading data: {error?.message}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No transaction data available for {selectedYear}</p>
            </div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="sticky top-0 bg-base-200/80 backdrop-blur-md z-[15]">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        className={`px-4 py-3 text-center text-sm font-semibold text-base-content uppercase tracking-wider ${
                          index === 0 ? 'sticky left-0 bg-base-200/80 backdrop-blur-md z-[25]' : ''
                        }`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-base-100 divide-y divide-base-content/20">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-base-200 transition-colors group">
                    {row.getVisibleCells().map((cell, index) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3 text-sm ${index === 0 ? 
                          'sticky left-0 bg-base-100 group-hover:bg-base-200 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                          }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 bg-base-100 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 border border-green-400 rounded"></div>
              <span className="text-base-content/80">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 border border-red-400 rounded"></div>
              <span className="text-base-content/80">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
              <span className="text-base-content/80">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default MonthlyDues
