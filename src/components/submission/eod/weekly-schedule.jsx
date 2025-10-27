import React, { useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { Col, Row } from 'antd';
import { EOMReportService } from '@/common/services/eom-report';

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
  user,
  clinic,
  province,
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

  const fetchWeeklySchedule = useCallback(async () => {
    if (!clinic || !submissionDate || !user) return;

    try {
      const targetMonth = dayjs(submissionDate).format('MM');
      const targetYear = dayjs(submissionDate).format('YYYY');

      const res = await EOMReportService.getMonthlySchedule({
        regional_manager: user,
        clinic_id: clinic,
        province: province,
        target_year: targetYear,
        target_month: targetMonth
      });

      if (res.status === 200 && Array.isArray(res.data)) {
        const weekStart = dayjs(submissionDate).startOf('week').add(1, 'day');
        const weekDates = Array.from({ length: 7 }, (_, i) =>
          weekStart.add(i, 'day').format('YYYY-MM-DD')
        );

        const apiClosedDates = new Set(
          res.data.filter((item) => !item.status).map((item) => item.date)
        );

        const dayKeys = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ];
        const openDays = new Set();

        weekDates.forEach((date, index) => {
          const dayKey = dayKeys[index];
          if (dayKey !== 'sunday' && !apiClosedDates.has(date)) {
            openDays.add(dayKey);
          }
        });

        setSelectedDays(openDays);
      } else {
        setSelectedDays(
          new Set([
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
          ])
        );
      }
    } catch {
      setSelectedDays(
        new Set([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday'
        ])
      );
    }
  }, [clinic, user, province, submissionDate, setSelectedDays]);

  useEffect(() => {
    if (clinic && user && submissionDate) {
      fetchWeeklySchedule();
    }
  }, [clinic, user, submissionDate, fetchWeeklySchedule]);

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
