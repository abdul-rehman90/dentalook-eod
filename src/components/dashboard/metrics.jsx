import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

export default function Metrics({
  metrics,
  setModalState,
  metricModalColumns
}) {
  const handleCardClick = (metric) => {
    setModalState({
      visible: true,
      title: metric.title,
      data: metric.details || [],
      columns: metricModalColumns[metric.title]
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          onClick={() => handleCardClick(metric)}
          className="!border !border-solid !border-[#ececec] !rounded-xl shadow-[0px_14px_20px_0px_#0000000A] cursor-pointer"
        >
          <Statistic
            title={
              <span className="text-[#5D606D] font-semibold text-sm">
                {metric.title}
              </span>
            }
            value={metric.value}
            valueStyle={{
              display: 'flex',
              fontWeight: 600,
              fontSize: '30px',
              marginTop: '20px',
              color: '#1F1F1F',
              justifyContent: 'space-between'
            }}
            suffix={
              metric.percentage !== undefined && (
                <div
                  className={`inline-flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                    metric.percentage > 0
                      ? 'bg-[#E9F7EE] text-[#167F3D]'
                      : metric.percentage < 0
                      ? 'bg-[#FEF3F2] text-[#B42318]'
                      : 'bg-[#F2F4F7] text-[#344054]'
                  }`}
                >
                  {metric.percentage > 0 ? (
                    <ArrowUpOutlined />
                  ) : metric.percentage < 0 ? (
                    <ArrowDownOutlined />
                  ) : null}
                  {metric.percentage}
                </div>
              )
            }
          />
        </Card>
      ))}
    </div>
  );
}
