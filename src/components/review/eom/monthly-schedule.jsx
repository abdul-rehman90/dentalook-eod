import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import enUS from 'date-fns/locale/en-US';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
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

function CustomEvent({ event }) {
  return (
    <div
      style={{ backgroundColor: event.color }}
      className="text-white text-sm px-3 py-1 rounded-lg font-semibold shadow-md truncate"
    >
      {event.title}
    </div>
  );
}

export default function MonthlySchedule({ onNext }) {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getCurrentStepData, reportData } = useGlobalContext();
  const currentStepData = getCurrentStepData();
  const basicDetails = reportData.eom?.basic || {};

  const getDaysInMonth = (date) => {
    const start = dayjs(date).startOf('month');
    const end = dayjs(date).endOf('month');
    const days = [];
    for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
      days.push(d.format('YYYY-MM-DD'));
    }
    return days;
  };

  const mapScheduleToEvents = (date, closedDaysSet) => {
    const events = [];
    const allDays = getDaysInMonth(date);

    allDays.forEach((day) => {
      const isClosed = closedDaysSet.has(day);
      
      if (isClosed) {
        events.push({
          id: day,
          title: 'CLOSED',
          start: new Date(`${day}T00:00:00`),
          end: new Date(`${day}T23:59:59`),
          allDay: true,
          color: '#ef4444'
        });
      }
    });

    return events;
  };

  useEffect(() => {
    if (currentStepData.schedule_month) {
      setCurrentDate(new Date(currentStepData.schedule_month));
    } else {
      const submissionMonth = basicDetails.submission_month || dayjs().format('YYYY-MM-DD');
      setCurrentDate(dayjs(submissionMonth).add(1, 'month').toDate());
    }
  }, [currentStepData.schedule_month, basicDetails.submission_month]);

  useEffect(() => {
    const closedDays = new Set(currentStepData.closed_days || []);
    const mappedEvents = mapScheduleToEvents(currentDate, closedDays);
    setEvents(mappedEvents);
  }, [currentDate, currentStepData.closed_days]);

  useEffect(() => {
    window.addEventListener('stepNavigationNext', onNext);
    return () => {
      window.removeEventListener('stepNavigationNext', onNext);
    };
  }, [onNext]);

  return (
    <React.Fragment>
      <div style={{ padding: '0 24px' }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Monthly Schedule for {dayjs(currentDate).format('MMMM YYYY')}
          </h3>
        </div>
        
        <div className="h-[400px] md:h-[450px] w-full mb-6">
          <Calendar
            events={events}
            date={currentDate}
            localizer={localizer}
            style={{ height: '100%' }}
            components={{ event: CustomEvent }}
          />
        </div>
      </div>
      
      <StepNavigation
        onNext={onNext}
        className="border-t-1 border-t-[#F3F3F5] mt-6 pt-6 px-6"
      />
    </React.Fragment>
  );
}