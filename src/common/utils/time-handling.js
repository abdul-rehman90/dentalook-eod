import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getCanadianTimeFormatted = (timeZone = 'America/Toronto') => {
  return dayjs().tz(timeZone).format('dddd, D MMM h:mm A');
};
