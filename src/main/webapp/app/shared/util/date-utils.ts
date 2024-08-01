import dayjs from 'dayjs';

const DATE_FORMAT = 'YYYY-MM-DD';

export const convertDateTimeFromServer = (date: string | Date | null | undefined, dateFormat = DATE_FORMAT) =>
  date ? dayjs(date).format(DATE_FORMAT) : null;

export const convertDateTimeToServer = (date: string | Date | null | undefined) => (date ? dayjs(date).toDate() : null);

export const displayDefaultDateTime = (dateFormat = DATE_FORMAT) => dayjs().startOf('day').format(DATE_FORMAT);
