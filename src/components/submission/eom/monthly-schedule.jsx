'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import enUS from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { EOMReportService } from '@/common/services/eom-report';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useGlobalContext } from '@/common/context/global-context';
import StepNavigation from '@/common/components/step-navigation/step-navigation';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  parse,
  format,
  getDay,
  locales,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 })
});

const CustomToolbar = ({ label, onNavigate }) => (
  <div className="flex justify-between items-center py-4">
    <span className="text-lg font-semibold">{label}</span>
    <div className="flex items-center gap-2">
      {['PREV', 'NEXT'].map((dir, i) => (
        <Button
          key={dir}
          size="sm"
          onClick={() => onNavigate(dir)}
          className="py-2 !bg-gray-200 !text-gray-700 flex items-center justify-center"
        >
          {i === 0 ? <LeftOutlined /> : <RightOutlined />}
        </Button>
      ))}
    </div>
  </div>
);

const CustomEvent = ({ event }) => (
  <div
    style={{ backgroundColor: event.color }}
    className="text-white text-sm px-3 py-1 rounded-lg font-semibold shadow-md truncate cursor-pointer"
  >
    {event.title}
  </div>
);

export default function MonthlySchedule() {
  const router = useRouter();
  const isSavingRef = useRef(false);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);
  const [closedDays, setClosedDays] = useState(new Set());
  const {
    id,
    steps,
    setLoading,
    reportData,
    currentStep,
    updateStepData,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  } = useGlobalContext();
  const currentStepId = steps[currentStep - 1]?.id;
  const basic = reportData?.eom?.basic || {};
  const { clinic: clinicId, province_id, province, submission_month } = basic;
  const provinceId = province_id || province;
  const regional_manager = basic?.regional_manager_id || basic?.user;

  const getNextMonth = useCallback(
    () => dayjs(submission_month).add(1, 'month').toDate(),
    [submission_month]
  );

  const getDaysInMonth = (date) => {
    const start = dayjs(date).startOf('month');
    const end = dayjs(date).endOf('month');
    const days = [];
    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, 'day');
      d = d.add(1, 'day')
    )
      days.push(d.format('YYYY-MM-DD'));
    return days;
  };

  const mapScheduleToEvents = (date, closed) =>
    getDaysInMonth(date)
      .filter((d) => closed.has(d))
      .map((d) => ({
        id: d,
        allDay: true,
        title: 'CLOSED',
        color: '#ef4444',
        start: new Date(`${d}T00:00:00`),
        end: new Date(`${d}T23:59:59`)
      }));

  const handleSelectSlot = ({ start }) => {
    const dateStr = dayjs(start).format('YYYY-MM-DD');
    setClosedDays((prev) => {
      const newSet = new Set(prev);
      newSet.has(dateStr) ? newSet.delete(dateStr) : newSet.add(dateStr);
      return newSet;
    });
  };

  const handleSubmitEOMReport = async () => {
    try {
      setLoading(true);
      const res = await EOMReportService.submissionEOMReport({
        eomsubmission_id: id
      });
      if (res.status === 200) {
        toast.success('EOM submission successfully submitted');
        router.push('/review/list/eom');
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const saveData = useCallback(
    async (navigate = false) => {
      if (isSavingRef.current) return false;
      isSavingRef.current = true;

      try {
        setLoading(true);
        const targetMonth = dayjs(currentDate).format('MM');
        const targetYear = dayjs(currentDate).format('YYYY');
        const allDays = getDaysInMonth(currentDate);

        const dates = allDays.map((day) => ({
          date: day,
          status: !closedDays.has(day)
        }));

        const payload = {
          dates,
          regional_manager,
          clinic_id: clinicId,
          province: provinceId,
          target_year: targetYear,
          target_month: targetMonth
        };

        const res = await EOMReportService.addMonthlySchedule(payload);
        if (res.status === 201) {
          updateStepData(currentStepId, dates);
          toast.success('Record is successfully saved');
          if (navigate) await handleSubmitEOMReport();
          return true;
        }
        return false;
      } catch {
        toast.error('Failed to save monthly schedule');
        return false;
      } finally {
        setLoading(false);
        isSavingRef.current = false;
      }
    },
    [
      clinicId,
      closedDays,
      provinceId,
      setLoading,
      currentDate,
      currentStepId,
      updateStepData,
      regional_manager,
      handleSubmitEOMReport
    ]
  );

  const handleSave = useCallback(async () => saveData(false), [saveData]);
  const handleSubmit = useCallback(async () => saveData(true), [saveData]);

  const fetchMonthlySchedule = useCallback(async () => {
    if (!clinicId || !currentDate) return;

    try {
      const targetMonth = dayjs(currentDate).format('MM');
      const targetYear = dayjs(currentDate).format('YYYY');

      const res = await EOMReportService.getMonthlySchedule({
        regional_manager,
        clinic: clinicId,
        target_year: targetYear,
        target_month: targetMonth
      });

      if (res.status === 200 && Array.isArray(res.data)) {
        const closedFromAPI = new Set(
          res.data.filter((i) => !i.status).map((i) => i.date)
        );
        setClosedDays(closedFromAPI);
      }
    } catch {}
  }, [clinicId, regional_manager, currentDate]);

  useEffect(() => {
    if (!clinicId) return;
    const next = getNextMonth();
    setCurrentDate(next);
  }, [clinicId, getNextMonth]);

  useEffect(() => {
    if (clinicId && currentDate) {
      fetchMonthlySchedule();
    }
  }, [clinicId, currentDate, fetchMonthlySchedule]);

  useEffect(() => {
    setEvents(mapScheduleToEvents(currentDate, closedDays));
  }, [currentDate, closedDays]);

  useEffect(() => {
    const onSave = () => saveData(false);
    const onNext = () => saveData(true);

    window.addEventListener('stepNavigationSave', onSave);
    window.addEventListener('stepNavigationNext', onNext);

    return () => {
      window.removeEventListener('stepNavigationSave', onSave);
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [saveData]);

  useEffect(() => {
    registerStepSaveHandler(currentStep, async (navigate = false) => {
      return saveData(navigate);
    });
    return () => {
      unregisterStepSaveHandler(currentStep);
    };
  }, [
    saveData,
    currentStep,
    registerStepSaveHandler,
    unregisterStepSaveHandler
  ]);

  return (
    <React.Fragment>
      <div className="px-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Monthly Schedule for {dayjs(currentDate).format('MMMM YYYY')}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Click any day to mark it as closed. Sundays are closed by default.
          </p>
        </div>
        <div className="h-[400px] md:h-[450px] w-full mb-6">
          <Calendar
            selectable
            events={events}
            date={currentDate}
            localizer={localizer}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            style={{ height: '100%', cursor: 'pointer' }}
            onSelectEvent={({ start }) => handleSelectSlot({ start })}
            components={{ event: CustomEvent, toolbar: CustomToolbar }}
          />
        </div>
      </div>
      <StepNavigation
        onSave={handleSave}
        onNext={handleSubmit}
        className="border-t border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}
