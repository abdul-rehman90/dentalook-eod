import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getCanadianTimeFormatted = (timeZone = 'America/Toronto') => {
  return dayjs().tz(timeZone).format('dddd, D MMM h:mm A');
};

export const formatTimeForUI = (time24h) => {
  if (!time24h) return null;
  return dayjs(time24h, 'HH:mm:ss').format('h:mm a');
};

export const generateTimeSlots = (startHour, endHour, intervalMinutes) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const period = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeString = `${displayHour}:${
        minute === 0 ? '00' : minute
      } ${period}`;
      slots.push({ label: timeString, value: timeString });
    }
  }
  return slots;
};
