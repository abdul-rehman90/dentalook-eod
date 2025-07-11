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
