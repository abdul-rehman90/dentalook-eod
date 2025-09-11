import dayjs from 'dayjs';

export const MONTH_ORDER = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const DEFAULT_METRICS = [
  {
    value: '$0',
    details: [],
    percentage: 0,
    title: 'Total Production'
  },
  {
    value: 0,
    details: [],
    percentage: 0,
    title: 'Number of New Patients'
  },
  {
    value: 0,
    details: [],
    percentage: 0,
    title: 'Missed Opportunities'
  },
  {
    value: 0,
    details: [],
    title: 'Monthly Supplies'
  }
];

export const METRICS_MODAL_COLUMNS = {
  'Total Production': [
    {
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      key: 'provider_type',
      title: 'Provider Type',
      dataIndex: 'provider_type'
    },
    {
      key: 'clinic_name',
      title: 'Clinic Name',
      dataIndex: 'clinic_name'
    },
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    {
      key: 'total_production',
      title: 'Total Production',
      dataIndex: 'total_production',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    }
  ],
  'Production by Providers': [
    {
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      key: 'provider_type',
      title: 'Provider Type',
      dataIndex: 'provider_type'
    },
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    {
      title: 'Hours Work',
      key: 'provider_hours',
      dataIndex: 'provider_hours',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Production / Hour',
      key: 'production_per_hour',
      dataIndex: 'production_per_hour',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'total_production',
      title: 'Total Production',
      dataIndex: 'total_production',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    }
  ],
  'Number of New Patients': [
    { title: 'Source', dataIndex: 'source', key: 'source' },
    {
      key: 'no_of_patients',
      title: 'No of Patients',
      dataIndex: 'no_of_patients',
      render: (value, record) => {
        if (record.rowType === 'source') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Comments', dataIndex: 'comments', key: 'comments' }
  ],
  'Missed Opportunities': [
    {
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      title: 'Type',
      key: 'provider_type',
      dataIndex: 'provider_type'
    },
    { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    {
      title: 'Unfilled',
      key: 'unfilled_spots',
      dataIndex: 'unfilled_spots',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'no_shows',
      title: 'No Shows',
      dataIndex: 'no_shows',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Short Ntc',
      key: 'short_notice_cancellations',
      dataIndex: 'short_notice_cancellations',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Failed',
      key: 'failed_appointments',
      dataIndex: 'failed_appointments',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Total Hrs',
      key: 'total_number_in_hours',
      dataIndex: 'total_number_in_hours',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'total_value_missed',
      title: 'Total Value Missed',
      dataIndex: 'total_value_missed',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    }
  ],
  'Monthly Supplies': [
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    {
      title: 'Actual',
      key: 'supplies_actual',
      dataIndex: 'supplies_actual',
      render: (value) => (value ? `$${value.toFixed(2)}` : '')
    },
    {
      title: 'Monthly Budget',
      key: 'avg_budget_supplies',
      dataIndex: 'avg_budget_supplies',
      render: () => 0
    },
    {
      title: 'Remarks',
      key: 'overage_reason',
      dataIndex: 'overage_reason'
    }
  ],
  'Missed Opportunities by Providers': [
    {
      key: 'provider_name',
      title: 'Provider Name',
      dataIndex: 'provider_name'
    },
    {
      title: 'Type',
      key: 'provider_type',
      dataIndex: 'provider_type'
    },
    { title: 'Clinic Name', dataIndex: 'clinic_name', key: 'clinic_name' },
    {
      key: 'submission_date',
      title: 'Submission Date',
      dataIndex: 'submission_date',
      render: (value) => (value ? dayjs(value).format('MMM DD, YYYY') : '')
    },
    {
      title: 'Unfilled',
      key: 'unfilled_spots',
      dataIndex: 'unfilled_spots',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'no_shows',
      title: 'No Shows',
      dataIndex: 'no_shows',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Short Ntc',
      key: 'short_notice_cancellations',
      dataIndex: 'short_notice_cancellations',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Failed',
      key: 'failed_appointments',
      dataIndex: 'failed_appointments',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      title: 'Total Hrs',
      key: 'total_number_in_hours',
      dataIndex: 'total_number_in_hours',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    },
    {
      key: 'total_value_missed',
      title: 'Total Value Missed',
      dataIndex: 'total_value_missed',
      render: (value, record) => {
        if (record.rowType === 'provider') {
          return <span className="font-semibold text-gray-800">{value}</span>;
        }
        return <span>{value}</span>;
      }
    }
  ]
};
