'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import enUS from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { useProgress } from '@bprogress/next';
import { Card, Select, Statistic } from 'antd';
import { Button } from '@/common/components/button/button';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { EODReportService } from '@/common/services/eod-report';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  parse,
  format,
  getDay,
  locales,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 })
});

const statusColors = {
  Draft: '#facc15',
  Closed: '#9ca3af',
  Submitted: '#10b981',
  'Not started': '#ef4444'
};

function CustomToolbar({ label, onView, view, onNavigate }) {
  return (
    <div className="flex justify-between items-center py-4">
      <span className="text-lg font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        {['month', 'week'].map((v) => (
          <Button
            key={v}
            size="sm"
            onClick={() => onView(v)}
            className={`py-1 ${
              view === v
                ? '!bg-blue-600 !text-white'
                : '!bg-gray-200 !text-gray-700'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}

        <Button
          size="sm"
          onClick={() => onNavigate('PREV')}
          className="py-2 !bg-gray-200 !text-gray-700 flex items-center justify-center"
        >
          <LeftOutlined />
        </Button>
        <Button
          size="sm"
          onClick={() => onNavigate('NEXT')}
          className="py-2 !bg-gray-200 !text-gray-700 flex items-center justify-center"
        >
          <RightOutlined />
        </Button>
      </div>
    </div>
  );
}

function CustomEvent({ event }) {
  return (
    <div
      style={{ backgroundColor: event.color }}
      title={`${event.title} (${event.clinic})`}
      className="text-white text-sm px-3 py-1 rounded-lg font-semibold shadow-md truncate cursor-pointer"
    >
      {event.title}
    </div>
  );
}

export default function MyCalendar() {
  const router = useRouter();
  const progress = useProgress();
  const [events, setEvents] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    dayjs().startOf('month').toDate()
  );
  const [filters, setFilters] = useState({
    clinic_id: null,
    submission_date: dayjs().startOf('month').format('YYYY-MM-DD')
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEventClick = (event) => {
    if (event.id.toString().startsWith('missing')) return;
    progress.start();
    router.push(`/submission/eod/1/${event.id}`);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);

    const newMonth = dayjs(newDate).startOf('month').format('YYYY-MM-DD');
    if (newMonth !== filters.submission_date) {
      setFilters((prev) => ({
        ...prev,
        submission_date: newMonth
      }));
    }
  };

  const getDaysInMonth = (dateStr) => {
    const start = dayjs(dateStr).startOf('month');
    const end = dayjs(dateStr).endOf('month');
    const days = [];

    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, 'day');
      d = d.add(1, 'day')
    ) {
      days.push(d.format('YYYY-MM-DD'));
    }
    return days;
  };

  const getStatusSummary = (events) => {
    const counts = {
      Draft: 0,
      Closed: 0,
      Submitted: 0,
      'Not started': 0
    };

    events.forEach((ev) => {
      if (counts[ev.title] !== undefined) {
        counts[ev.title] += 1;
      }
    });

    return counts;
  };

  const mapReportsToEvents = (reports, monthDate) => {
    const events = [];
    const allDays = getDaysInMonth(monthDate);

    const reportedDays = new Set(
      reports.map((r) => dayjs(r.submission_date).format('YYYY-MM-DD'))
    );

    reports.forEach((report) => {
      const hasOpenClose = report.clinic_open_time && report.clinic_close_time;
      let status = hasOpenClose ? report.submitted : 'Closed';

      if (status === 'Completed') {
        status = 'Submitted';
      }

      const start = new Date(
        `${report.submission_date}T${report.clinic_open_time || '00:00:00'}`
      );
      const end = new Date(
        `${report.submission_date}T${report.clinic_close_time || '23:59:59'}`
      );

      events.push({
        end,
        start,
        allDay: true,
        id: report.id,
        title: status,
        clinic: report.clinic_name,
        color: statusColors[status] || '#9ca3af'
      });
    });

    // Fill missing days with "Not even started"
    allDays.forEach((day) => {
      if (!reportedDays.has(day)) {
        events.push({
          allDay: true,
          id: `missing-${day}`,
          title: 'Not started',
          end: new Date(`${day}T23:59:59`),
          start: new Date(`${day}T00:00:00`),
          color: statusColors['Not started']
        });
      }
    });

    return events;
  };

  useEffect(() => {
    const fetchAllClinics = async () => {
      try {
        const { data } = await EODReportService.getAllRegionalManagers();
        const clinicsData = data.clinics.map((item) => ({
          value: item.id,
          label: item.name
        }));
        setClinics(clinicsData);

        if (clinicsData.length > 0) {
          setFilters((prev) => ({
            ...prev,
            clinic_id: clinicsData[0].value
          }));
        }
      } catch (error) {}
    };
    fetchAllClinics();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.clinic_id || !filters.submission_date) return;

      try {
        const { data } = await EODReportService.getAllReports(filters);
        const mappedEvents = mapReportsToEvents(data, filters.submission_date);
        setEvents(mappedEvents);
      } catch (error) {
      } finally {
      }
    };

    fetchData();
  }, [filters]);

  return (
    <div className="p-5 bg-white mx-13 my-4">
      <div className="w-full max-w-[250px] ml-auto flex items-center gap-2 mb-4">
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xs text-gray-900 font-medium whitespace-nowrap">
            Clinics
          </p>
          <Select
            size="large"
            options={clinics}
            className="custom-filter"
            value={filters.clinic_id}
            placeholder="Select Clinic"
            onChange={(value) => handleFilterChange('clinic_id', value)}
          />
        </div>
      </div>
      {events.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(getStatusSummary(events)).map(([status, count]) => (
            <Card
              key={status}
              bodyStyle={{ padding: '12px 16px' }}
              className="!border !border-solid !border-[#ececec] !rounded-xl shadow-[0px_14px_20px_0px_#0000000A] cursor-pointer"
            >
              <Statistic
                title={
                  <span className="text-[#5D606D] font-semibold text-sm">
                    {status}
                  </span>
                }
                value={count}
                valueStyle={{
                  fontWeight: 600,
                  color: '#1F1F1F',
                  fontSize: '20px',
                  marginTop: '10px'
                }}
              />
            </Card>
          ))}
        </div>
      )}
      <div className="h-[400px] md:h-[450px] w-full">
        <Calendar
          events={events}
          endAccessor="end"
          date={currentDate}
          startAccessor="start"
          localizer={localizer}
          style={{ height: '100%' }}
          onNavigate={handleNavigate}
          onSelectEvent={handleEventClick}
          components={{ event: CustomEvent, toolbar: CustomToolbar }}
        />
      </div>
    </div>
  );
}
