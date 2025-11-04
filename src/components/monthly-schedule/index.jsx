'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Form, Row } from 'antd';
import toast from 'react-hot-toast';
import enUS from 'date-fns/locale/en-US';
import { FormControl } from '@/common/utils/form-control';
import { Button } from '@/common/components/button/button';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { EOMReportService } from '@/common/services/eom-report';
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

export default function MonthlySchedulePage() {
  const [form] = Form.useForm();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    dayjs().add(1, 'month').toDate()
  );
  const [practices, setPractices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [closedDays, setClosedDays] = useState(new Set());
  const [regionalManagers, setRegionalManagers] = useState([]);

  const getDaysInMonth = useCallback((date) => {
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
  }, []);

  const mapScheduleToEvents = useCallback(
    (date, closed) =>
      getDaysInMonth(date)
        .filter((d) => closed.has(d))
        .map((d) => ({
          id: d,
          allDay: true,
          title: 'CLOSED',
          color: '#ef4444',
          start: new Date(`${d}T00:00:00`),
          end: new Date(`${d}T23:59:59`)
        })),
    [getDaysInMonth]
  );

  const handleSelectSlot = ({ start }) => {
    const dateStr = dayjs(start).format('YYYY-MM-DD');
    setClosedDays((prev) => {
      const newSet = new Set(prev);
      newSet.has(dateStr) ? newSet.delete(dateStr) : newSet.add(dateStr);
      return newSet;
    });
  };

  const fetchMonthlySchedule = useCallback(
    async (customValues) => {
      const values = customValues || form.getFieldsValue();
      const { clinic, user, submission_month } = values;
      if (!clinic || !user || !submission_month) return;

      try {
        const targetDate = dayjs(submission_month).add(1, 'month');
        const targetMonth = targetDate.format('MM');
        const targetYear = targetDate.format('YYYY');

        const res = await EOMReportService.getMonthlySchedule({
          clinic,
          regional_manager: user,
          target_year: targetYear,
          target_month: targetMonth
        });

        if (res.status === 200 && Array.isArray(res.data)) {
          const closedFromAPI = new Set(
            res.data.filter((i) => !i.status).map((i) => i.date)
          );
          setClosedDays(closedFromAPI);
          setCurrentDate(targetDate.toDate());
        }
      } catch {
        toast.error('Failed to fetch schedule');
      }
    },
    [form]
  );

  const handleProvinceChange = async (provinceId) => {
    if (!provinceId) return;
    try {
      const { data } = await EODReportService.getDataOfProvinceById(provinceId);
      const clinics = data.clinics.map((clinic) => ({
        value: clinic.clinic_id,
        label: clinic.clinic_name,
        managers: clinic.regional_managers.map((m) => ({
          value: m.id,
          label: m.name
        }))
      }));

      const firstClinic = clinics[0];
      const firstManager = firstClinic?.managers?.[0];

      setPractices(clinics);
      setRegionalManagers(firstClinic?.managers || []);

      form.setFieldsValue({
        clinic: firstClinic?.value,
        user: firstManager?.value
      });

      const currentMonth = form.getFieldValue('submission_month');
      if (firstClinic?.value && firstManager?.value && currentMonth) {
        await fetchMonthlySchedule({
          province: provinceId,
          clinic: firstClinic.value,
          user: firstManager.value,
          submission_month: currentMonth
        });
      }
    } catch {
      toast.error('Failed to load clinics');
    }
  };

  const handleClinicChange = (clinicId) => {
    if (!clinicId) return;
    const selectedClinic = practices.find((c) => c.value === clinicId);
    if (selectedClinic?.managers?.length) {
      setRegionalManagers(selectedClinic.managers);
      const firstManager = selectedClinic.managers[0];
      form.setFieldsValue({ user: firstManager.value });

      const currentMonth = form.getFieldValue('submission_month');
      if (firstManager?.value && currentMonth) {
        fetchMonthlySchedule({
          clinic: clinicId,
          user: firstManager.value,
          submission_month: currentMonth
        });
      }
    } else {
      setRegionalManagers([]);
      form.setFieldsValue({ user: undefined });
    }
  };

  const handleMonthChange = async (month) => {
    if (!month) return;
    const values = form.getFieldsValue();
    const { clinic, user } = values;
    if (clinic && user) {
      await fetchMonthlySchedule({
        user,
        clinic,
        submission_month: month
      });
    }
  };

  const handleCalendarNavigate = async (newDate) => {
    setCurrentDate(newDate);

    const values = form.getFieldsValue();
    const { clinic, user } = values;
    if (!clinic || !user) return;

    const submissionMonth = dayjs(newDate).subtract(1, 'month');
    form.setFieldsValue({ submission_month: submissionMonth });

    await fetchMonthlySchedule({
      user,
      clinic,
      submission_month: submissionMonth
    });
  };

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const { clinic, user, province, submission_month } = values;
      setLoading(true);

      const targetDate = dayjs(submission_month).add(1, 'month');
      const allDays = getDaysInMonth(targetDate.toDate());
      const targetMonth = targetDate.format('MM');
      const targetYear = targetDate.format('YYYY');

      const dates = allDays.map((day) => ({
        date: day,
        status: !closedDays.has(day)
      }));

      const payload = {
        dates,
        province,
        clinic_id: clinic,
        regional_manager: user,
        target_year: targetYear,
        target_month: targetMonth
      };

      const res = await EOMReportService.addMonthlySchedule(payload);
      if (res.status === 201) toast.success('Record successfully saved');
    } catch {
      toast.error('Failed to save monthly schedule');
    } finally {
      setLoading(false);
    }
  }, [form, closedDays, getDaysInMonth]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await EODReportService.getAllProvinces();
        const provinceOptions = data.map((p) => ({
          value: p.id,
          label: p.name
        }));
        setProvinces(provinceOptions);

        if (provinceOptions.length > 0) {
          form.setFieldsValue({
            province: provinceOptions[0].value,
            submission_month: dayjs()
          });
          await handleProvinceChange(provinceOptions[0].value);
        }
      } catch {
        toast.error('Failed to load provinces');
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    setEvents(mapScheduleToEvents(currentDate, closedDays));
  }, [currentDate, closedDays, mapScheduleToEvents]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Form form={form}>
        <Row justify="space-between">
          <FormControl
            required
            name="province"
            control="select"
            label="Province"
            options={provinces}
            onChange={handleProvinceChange}
          />
          <FormControl
            required
            name="user"
            control="select"
            label="Regional Manager"
            options={regionalManagers}
          />
        </Row>
        <Row justify="space-between">
          <FormControl
            required
            name="clinic"
            control="select"
            label="Practice Name"
            options={practices}
            onChange={handleClinicChange}
          />
          <FormControl
            required
            control="date"
            picker="month"
            format="MMM YYYY"
            name="submission_month"
            label="Submission Month"
            placeholder="Select Month"
            onChange={handleMonthChange}
          />
        </Row>
      </Form>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">
          Monthly Schedule for{' '}
          {form.getFieldValue('submission_month')
            ? dayjs(form.getFieldValue('submission_month'))
                .add(1, 'month')
                .format('MMMM YYYY')
            : dayjs(currentDate).format('MMMM YYYY')}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Click any day to mark it as closed. Sundays are closed by default.
        </p>
        <div className="h-[450px] w-full mb-6 overflow-hidden">
          <Calendar
            selectable
            events={events}
            date={currentDate}
            localizer={localizer}
            onNavigate={handleCalendarNavigate}
            onSelectSlot={handleSelectSlot}
            style={{ height: '100%', cursor: 'pointer' }}
            onSelectEvent={({ start }) => handleSelectSlot({ start })}
            components={{ event: CustomEvent, toolbar: CustomToolbar }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          isLoading={loading}
          onClick={handleSave}
          className="px-8 py-2"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
