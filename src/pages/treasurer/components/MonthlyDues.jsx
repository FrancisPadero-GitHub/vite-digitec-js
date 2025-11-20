import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router';
import { useMemberRole } from '../../../backend/context/useMemberRole';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import { useFetchClubFundsView } from '../../../backend/hooks/shared/view/useFetchClubFundsView';

const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

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

  const { data: club_funds_data, isLoading, isError, error } = useFetchClubFundsView({});
  const clubFundsRaw = club_funds_data?.data || [];

  // Get unique members from the data
  const memberOptions = useMemo(() => {
    if (!clubFundsRaw || clubFundsRaw.length === 0) return [];

    const uniqueMembers = new Map();
    clubFundsRaw.forEach(record => {
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
  }, [clubFundsRaw]);

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
    return allMonths.filter((_, index) => index > startMonth);
  }, [startMonth]);

  // Get available months for "From" dropdown based on "To" selection
  const availableStartMonths = useMemo(() => {
    // Must be at least 1 month before endMonth
    return allMonths.filter((_, index) => index < endMonth);
  }, [endMonth]);

  // Get filtered month range
  const filteredMonths = useMemo(() => {
    return allMonths.slice(startMonth, endMonth + 1);
  }, [startMonth, endMonth]);

  // Generate columns based on filtered months
  const columns = useMemo(() => [
    {
      accessorKey: 'member',
      header: 'Members',
      cell: info => <div className="font-medium text-gray-900 whitespace-nowrap">{info.getValue()}</div>,
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
              ? 'bg-green-100 text-green-800'
              : value === 'Missed'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-50 text-gray-400'
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
    if (!clubFundsRaw || clubFundsRaw.length === 0) return [];

    // Filter for Monthly Dues only and selected year
    let monthlyDues = clubFundsRaw.filter(record => {
      if (!record.payment_date) return false;
      const paymentYear = new Date(record.payment_date).getFullYear();
      return record.category === 'Monthly Dues' && paymentYear === selectedYear;
    });

    // Filter by selected member if not 'all'
    if (selectedMember !== 'all') {
      monthlyDues = monthlyDues.filter(record =>
        record.account_number === selectedMember
      );
    }

    // Group by member
    const memberMap = new Map();

    monthlyDues.forEach(record => {
      const memberName = record.full_name;
      const paymentDate = new Date(record.payment_date);
      const month = paymentDate.getMonth(); // 0-11

      if (!memberMap.has(memberName)) {
        memberMap.set(memberName, {
          member: memberName,
          Jan: '', Feb: '', Mar: '', Apr: '', May: '', Jun: '',
          Jul: '', Aug: '', Sept: '', Oct: '', Nov: '', Dec: ''
        });
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      const memberData = memberMap.get(memberName);
      memberData[monthNames[month]] = 'Paid';
    });

    // Convert map to array and mark missed payments for past months
    const result = Array.from(memberMap.values()).map(memberData => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

      monthNames.forEach((monthName, index) => {
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

    return result;
  }, [clubFundsRaw, selectedYear, currentYear, currentMonth, startMonth, endMonth, selectedMember])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className='flex justify-between' >
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Monthly Dues</h1>

            <button
              className="btn btn-success"
              title="Manage Monthly Dues"
              aria-label="Manage Monthly Dues"
              type="button"
              onClick={() => navigate(`/${memberRole}/club-funds`)}
            >
              
               Back
            </button>

          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
            <button
              onClick={() => {
                setSelectedYear(currentYear);
                setStartMonth(0);
                setEndMonth(11);
                setSelectedMember('all');
                setMemberSearch('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear Filters
            </button>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Member Filter - Searchable */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showMemberDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMemberDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div
                        onClick={() => {
                          setSelectedMember('all');
                          setMemberSearch('');
                          setShowMemberDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-200 font-medium text-gray-900"
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
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                          >
                            <div className="font-medium">{member.full_name}</div>
                            <div className="text-xs text-gray-500">{member.account_number}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">
                          No members found
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Start Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Month
              </label>
              <select
                value={startMonth}
                onChange={(e) => {
                  const newStart = Number(e.target.value);
                  setStartMonth(newStart);
                  // Automatically adjust end month if it's not valid anymore
                  if (newStart >= endMonth) {
                    // Set end month to at least 1 month after start, or December if start is December
                    setEndMonth(Math.min(newStart + 1, 11));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableStartMonths.map((month) => {
                  const monthIndex = allMonths.indexOf(month);
                  return (
                    <option key={month} value={monthIndex}>{month}</option>
                  );
                })}
              </select>
            </div>

            {/* End Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Month
              </label>
              <select
                value={endMonth}
                onChange={(e) => {
                  const newEnd = Number(e.target.value);
                  setEndMonth(newEnd);
                  // Automatically adjust start month if it's not valid anymore
                  if (newEnd <= startMonth) {
                    // Set start month to at least 1 month before end, or January if end is January
                    setStartMonth(Math.max(newEnd - 1, 0));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableEndMonths.map((month) => {
                  const monthIndex = allMonths.indexOf(month);
                  return (
                    <option key={month} value={monthIndex}>{month}</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-blue-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Club Funds Monthly Payables Record ({selectedYear}) - {allMonths[startMonth]} to {allMonths[endMonth]}
              </h2>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] min-h-[20vh]">
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
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                        {headerGroup.headers.map((header, index) => (
                          <th
                            key={header.id}
                            className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${index === 0 ? 'sticky left-0 bg-gray-100 z-20' : ''
                              }`}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                        {row.getVisibleCells().map((cell, index) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 text-sm ${index === 0 ? 'sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
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

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-gray-600">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span className="text-gray-600">Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyDues
