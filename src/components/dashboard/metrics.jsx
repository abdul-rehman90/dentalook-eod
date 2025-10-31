import React, { useState } from 'react';
import { Card, Statistic } from 'antd';

export default function Metrics({
  metrics,
  setModalState,
  metricModalColumns
}) {
  const [showAttrition, setShowAttrition] = useState(false);

  const handleCardClick = (metric) => {
    if (metric.title === 'Number of New Patients') {
      setModalState({
        visible: true,
        title: 'Patient Data',
        data: metric.details || [],
        columns: metricModalColumns[metric.title],
        attritionData: metric.attritionData || []
      });
    } else {
      setModalState({
        visible: true,
        attritionData: [],
        title: metric.title,
        data: metric.details || [],
        columns: metricModalColumns[metric.title]
      });
    }
  };

  const getDisplayMetric = (metric) => {
    if (metric.title === 'Number of New Patients') {
      return {
        ...metric,
        title: showAttrition
          ? 'Number of Attritions'
          : 'Number of New Patients',
        value: showAttrition ? metric.attritionData?.length || 0 : metric.value
      };
    }
    return metric;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const displayMetric = getDisplayMetric(metric);
        return (
          <Card
            key={index}
            onClick={() => handleCardClick(metric)}
            className="!border !border-solid !border-[#ececec] !rounded-xl shadow-[0px_14px_20px_0px_#0000000A] cursor-pointer"
          >
            <Statistic
              title={
                <div className="flex items-center justify-between">
                  <span className="text-[#5D606D] font-semibold text-sm">
                    {displayMetric.title}
                  </span>
                  {metric.title === 'Number of New Patients' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAttrition(!showAttrition);
                      }}
                      className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showAttrition ? 'Show Patients' : 'Show Attritions'}
                    </button>
                  )}
                </div>
              }
              valueRender={() => (
                <div className="flex items-end justify-between mt-5">
                  <div className="flex items-end gap-1">
                    <span className="text-[30px] font-semibold text-[#1F1F1F] leading-none">
                      {displayMetric.value}
                    </span>
                    {metric.title === 'Missed Opportunities' && (
                      <span className="text-[#5D606D] font-semibold text-xs mb-[3px]">
                        Hrs
                      </span>
                    )}
                  </div>
                  {metric.title === 'Missed Opportunities' &&
                    metric.percentage !== undefined && (
                      <span className="text-sm font-semibold px-2 py-1 rounded-full bg-[#FEECEC] text-[#7F1D1D]">
                        {metric.percentage}
                      </span>
                    )}
                </div>
              )}
            />
          </Card>
        );
      })}
    </div>
  );
}
