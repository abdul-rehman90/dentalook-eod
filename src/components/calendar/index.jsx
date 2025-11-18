'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import enUS from 'date-fns/locale/en-US';
import { useRouter } from 'next/navigation';
import { useProgress } from '@bprogress/next';
import { Button } from '@/common/components/button/button';
import { Card, Select, Statistic, Tabs, Table } from 'antd';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { EODReportService } from '@/common/services/eod-report';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import DateRangePicker from '@/common/components/date-range/date-range';

const formatLocalDate = (date) => date.toISOString().split('T')[0];
const now = new Date();
const firstDay = formatLocalDate(
  new Date(now.getFullYear(), now.getMonth(), 2)
);
const lastDay = formatLocalDate(now);

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

const renderTab = (label, count, status) => {
  const getBadgeColor = () => {
    if (status === 'All') return '#3b82f6';
    return statusColors[status] || '#3b82f6';
  };

  return (
    <div className="text-center font-medium text-sm flex items-center justify-center gap-2">
      {label}
      {count > 0 && (
        <span
          className="text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center"
          style={{ backgroundColor: getBadgeColor() }}
        >
          {count}
        </span>
      )}
    </div>
  );
};

const generateUniqueId = (() => {
  let counter = 1;
  return () => Date.now() + counter++;
})();

export default function MyCalendar() {
  const router = useRouter();
  const progress = useProgress();
  const [events, setEvents] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [submissionData, setSubmissionData] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    dayjs().startOf('month').toDate()
  );
  const [filters, setFilters] = useState({
    clinic_id: null,
    submission_date: dayjs().format('YYYY-MM-DD')
  });
  const [dateRange, setDateRange] = useState({
    start_date: firstDay,
    end_date: lastDay
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

    const newDate_formatted = dayjs(newDate).format('YYYY-MM-DD');
    if (newDate_formatted !== filters.submission_date) {
      setFilters((prev) => ({
        ...prev,
        submission_date: newDate_formatted
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

  const getFilteredTableData = () => {
    if (activeTab === 'All') return submissionData;
    return submissionData.filter((item) => item.status === activeTab);
  };

  const getStatusCounts = () => {
    const counts = {
      All: submissionData.length,
      Draft: 0,
      Closed: 0,
      Submitted: 0,
      'Not started': 0
    };

    submissionData.forEach((item) => {
      const status =
        item.status === 'Not Started' ? 'Not started' : item.status;
      if (counts[status] !== undefined) counts[status]++;
    });

    return counts;
  };

  const tableColumns = [
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      key: 'clinic_name',
      title: 'Clinic Name',
      dataIndex: 'clinic_name'
    },
    {
      title: 'Regional Manager',
      key: 'regional_manager_name',
      dataIndex: 'regional_manager_name'
    },
    {
      title: 'Province',
      key: 'province_name',
      dataIndex: 'province_name'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <span
          className="px-3 py-1 rounded-full text-white text-sm font-medium"
          style={{
            backgroundColor: statusColors[status] || '#9ca3af'
          }}
        >
          {status}
        </span>
      )
    }
  ];

  const mapReportsToEvents = (reports, monthDate) => {
    const events = [];
    const tableRows = [];
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

      tableRows.push({
        id: report.id,
        key: report.id,
        status: status,
        clinic_name: report.clinic_name,
        submission_date: report.submission_date,
        clinic_open_time: report.clinic_open_time,
        clinic_close_time: report.clinic_close_time
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

    // setTableData(tableRows);
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

  useEffect(() => {
    const fetchSubmissionList = async () => {
      try {
        setLoading(true);
        const { data } = await EODReportService.getAllSubmissionTrackerTable({
          start_date: dayjs(dateRange.start_date),
          end_date: dayjs(dateRange.end_date)
        });

        const mappedData = data.map((item) => {
          let status;
          if (item.status === 'close') status = 'Closed';
          else if (item.submitted === 'Completed') status = 'Submitted';
          else if (item.status === 'Not Started') status = 'Not started';
          else status = 'Draft';

          const id =
            item.eodsubmission_id !== null
              ? item.eodsubmission_id
              : generateUniqueId();

          return {
            id,
            status,
            key: id,
            clinic_name: item.clinic_name,
            province_name: item.province_name,
            submission_date: item.submission_date,
            regional_manager_name: item.regional_manager_name
          };
        });

        setSubmissionData(mappedData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionList();
  }, [dateRange]);

  return (
    <div className="p-5 bg-white mx-13 my-4">
      <div className="flex justify-end items-end mb-4">
        <div className="flex flex-col gap-2">
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
      <div className="h-[400px] md:h-[450px] w-full mb-6">
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
      {/* <div className="relative flex justify-between items-center my-6">
        <h2 className="text-lg font-semibold">Clinic Submissions Tracker</h2>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>
      <div>
        <Tabs
          size="large"
          tabBarGutter={0}
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-status-tabs w-full"
          items={[
            {
              key: 'All',
              label: renderTab('All', getStatusCounts().All, 'All')
            },
            {
              key: 'Submitted',
              label: renderTab(
                'Submitted',
                getStatusCounts().Submitted,
                'Submitted'
              )
            },
            {
              key: 'Draft',
              label: renderTab('Draft', getStatusCounts().Draft, 'Draft')
            },
            {
              key: 'Closed',
              label: renderTab('Closed', getStatusCounts().Closed, 'Closed')
            },
            {
              key: 'Not started',
              label: renderTab(
                'Not Started',
                getStatusCounts()['Not started'],
                'Not started'
              )
            }
          ]}
        />
        <Table
          size="small"
          className="mt-6"
          loading={loading}
          pagination={false}
          columns={tableColumns}
          dataSource={getFilteredTableData()}
        />
      </div> */}
    </div>
  );
}
