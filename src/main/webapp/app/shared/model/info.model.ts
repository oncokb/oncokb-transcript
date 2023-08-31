import dayjs from 'dayjs';

export interface IInfo {
  id?: number;
  type?: string;
  value?: string | null;
  created?: string | null;
  lastUpdated?: string | null;
}

export const defaultValue: Readonly<IInfo> = {};
