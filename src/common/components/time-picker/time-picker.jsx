import React from 'react';
import { Form, TimePicker } from 'antd';

export default function TimePickerField({
  name,
  label,
  required,
  disabled,
  placeholder,
  message = ''
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ['00', '30'];

  const disabledTime = () => {
    return {
      disabledMinutes: () =>
        Array.from({ length: 60 }, (_, i) => i).filter(
          (i) => i !== 0 && i !== 30
        )
    };
  };

  return (
    <Form.Item
      name={name}
      labelAlign="left"
      labelCol={{ span: 10 }}
      style={{ width: '50%' }}
      wrapperCol={{ span: 13 }}
      rules={[{ required, message: `${label} is required` }]}
      label={
        <span className="text-[15px] font-medium text-black">
          {label} {required ? <span className="text-[#E62E2E]">*</span> : null}
        </span>
      }
    >
      <TimePicker
        format="HH:mm"
        showNow={false}
        minuteStep={30}
        needConfirm={false}
        disabled={disabled}
        inputReadOnly={true}
        style={{ width: '100%' }}
        disabledTime={disabledTime}
        // popupClassName="hide-ok-button"
        popupClassName="single-click-timepicker"
        // renderExtraFooter={() => (
        //   <div className="ant-picker-footer-extra">
        //     {hours.map((hour) => (
        //       <div key={hour} className="hour-row">
        //         {minutes.map((minute) => (
        //           <div
        //             key={`${hour}-${minute}`}
        //             className="time-option"
        //             onClick={() => {
        //               const time = `${hour
        //                 .toString()
        //                 .padStart(2, '0')}:${minute}`;
        //               // You would need to handle the time selection here
        //               // This would require a ref to the TimePicker
        //             }}
        //           >
        //             {`${hour}:${minute}`}
        //           </div>
        //         ))}
        //       </div>
        //     ))}
        //   </div>
        // )}
      />
    </Form.Item>
  );
}
