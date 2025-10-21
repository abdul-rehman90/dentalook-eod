import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Col, Row } from 'antd';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' }
];

export default function WeeklySchedule({
  selectedDays,
  submissionDate,
  setSelectedDays
}) {
  const toggleDay = (dayKey) => {
    setSelectedDays((prev) => {
      const newSet = new Set(prev);
      newSet.has(dayKey) ? newSet.delete(dayKey) : newSet.add(dayKey);
      return newSet;
    });
  };

  const weekDays = useMemo(() => {
    const baseDate = dayjs(submissionDate || dayjs());
    const dayOfWeek = baseDate.day();

    const startOfWeek =
      dayOfWeek === 0
        ? baseDate.subtract(6, 'day')
        : baseDate.subtract(dayOfWeek - 1, 'day');

    return DAYS_OF_WEEK.map((day, i) => ({
      ...day,
      date: startOfWeek.add(i, 'day')
    }));
  }, [submissionDate]);

  return (
    <Row className="my-3 border-t-1 border-t-secondary-50 pt-6">
      <Col span={24}>
        <div className="mb-4">
          <label className="text-xl font-medium mb-4 block">
            Weekly Schedule
            <span className="text-sm text-gray-500 ml-2">
              (Select the days which are closed this week)
            </span>
          </label>

          <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto_auto] gap-2">
            {weekDays.map((day) => {
              const isSelected = selectedDays.has(day.key);
              return (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={`px-3 py-2.5 cursor-pointer rounded-lg font-medium text-sm transition-all ${
                    isSelected
                      ? 'bg-white text-gray-700 border border-solid border-gray-100 shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                  }
              `}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={`${isSelected ? 'tex-xs' : 'text-[10px]'}`}
                    >
                      {day.label},
                    </span>
                    <span
                      className={`${isSelected ? 'tex-xs' : 'text-[10px]'}`}
                    >
                      {day.date.format('DD MMM')}
                    </span>
                    {!isSelected && (
                      <span className="text-xs text-white">(Closed)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Col>
    </Row>
  );
}
