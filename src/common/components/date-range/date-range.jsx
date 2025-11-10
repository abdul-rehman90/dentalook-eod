import React, { useState } from 'react';
import {
  DateRangePicker as ReactDateRangePicker,
  createStaticRanges
} from 'react-date-range';
import {
  format,
  addDays,
  subWeeks,
  subMonths,
  subYears,
  endOfWeek,
  endOfYear,
  endOfMonth,
  startOfWeek,
  startOfYear,
  subQuarters,
  startOfMonth,
  endOfQuarter,
  startOfQuarter
} from 'date-fns';

export default function DateRangePicker({
  dateRange,
  setDateRange,
  className = ''
}) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState([
    {
      key: 'selection',
      endDate: new Date(dateRange.end_date),
      startDate: new Date(dateRange.start_date)
    }
  ]);

  const customRanges = [
    { label: 'Today', range: () => ({ startDate: now, endDate: now }) },
    {
      label: 'Yesterday',
      range: () => ({ startDate: addDays(now, -1), endDate: addDays(now, -1) })
    },
    {
      label: 'This Week',
      range: () => ({ startDate: startOfWeek(now), endDate: endOfWeek(now) })
    },
    {
      label: 'Last Week',
      range: () => ({
        startDate: startOfWeek(subWeeks(now, 1)),
        endDate: endOfWeek(subWeeks(now, 1))
      })
    },
    {
      label: 'This Month',
      range: () => ({ startDate: startOfMonth(now), endDate: endOfMonth(now) })
    },
    {
      label: 'Last Month',
      range: () => ({
        startDate: startOfMonth(subMonths(now, 1)),
        endDate: endOfMonth(subMonths(now, 1))
      })
    },
    {
      label: 'Last 30 Days',
      range: () => ({ startDate: addDays(now, -30), endDate: now })
    },
    {
      label: 'Last 90 Days',
      range: () => ({ startDate: addDays(now, -90), endDate: now })
    },
    {
      label: 'This Quarter',
      range: () => ({
        startDate: startOfQuarter(now),
        endDate: endOfQuarter(now)
      })
    },
    {
      label: 'Last Quarter',
      range: () => ({
        startDate: startOfQuarter(subQuarters(now, 1)),
        endDate: endOfQuarter(subQuarters(now, 1))
      })
    },
    {
      label: 'Week to Date',
      range: () => ({ startDate: startOfWeek(now), endDate: now })
    },
    {
      label: 'Month to Date',
      range: () => ({ startDate: startOfMonth(now), endDate: now })
    },
    {
      label: 'Quarter to Date',
      range: () => ({ startDate: startOfQuarter(now), endDate: now })
    },
    {
      label: 'Year to Date',
      range: () => ({ startDate: startOfYear(now), endDate: now })
    },
    {
      label: 'This Year',
      range: () => ({ startDate: startOfYear(now), endDate: endOfYear(now) })
    },
    {
      label: 'Last Year',
      range: () => ({
        startDate: startOfYear(subYears(now, 1)),
        endDate: endOfYear(subYears(now, 1))
      })
    }
  ];

  const staticRanges = createStaticRanges(customRanges);
  const formatDate = (date) => format(date, 'dd/MM/yyyy');

  const handleApply = () => {
    setOpen(false);
    setDateRange({
      end_date: format(range[0].endDate, 'yyyy-MM-dd'),
      start_date: format(range[0].startDate, 'yyyy-MM-dd')
    });
  };

  const isActive =
    format(dateRange.start_date, 'yyyy-MM-dd') !==
      format(startOfWeek(now), 'yyyy-MM-dd') ||
    format(dateRange.end_date, 'yyyy-MM-dd') !==
      format(endOfWeek(now), 'yyyy-MM-dd');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-slate-700 ml-1">
        Date Range
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-[260px] flex justify-between items-center bg-white border rounded-lg px-4 py-2 text-sm text-slate-700 transition-all duration-200
          ${
            open
              ? 'border-teal-500 shadow-md'
              : isActive
              ? 'border-teal-600 ring-1 ring-teal-200'
              : 'border-slate-300 hover:border-slate-400'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span
            className={`font-medium truncate ${
              isActive ? 'text-teal-700' : 'text-slate-700'
            }`}
          >
            {`${formatDate(range[0].startDate)} - ${formatDate(
              range[0].endDate
            )}`}
          </span>
        </div>
      </button>

      {open && (
        <React.Fragment>
          <div className="fixed inset-0" onClick={() => setOpen(false)} />
          <div className="absolute -translate-x-4/4 left-4/4 top-[70px] z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ReactDateRangePicker
              months={2}
              ranges={range}
              inputRanges={[]}
              direction="horizontal"
              showSelectionPreview
              staticRanges={staticRanges}
              moveRangeOnFirstSelection={false}
              onChange={(item) => setRange([item.selection])}
            />
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 cursor-pointer text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 cursor-pointer text-sm font-semibold bg-[#026E78] text-white rounded-lg hover:bg-[#015e66] hover:shadow-md transition-all duration-200 active:scale-95"
              >
                Apply
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
