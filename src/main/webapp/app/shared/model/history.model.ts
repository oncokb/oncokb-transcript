import dayjs from 'dayjs';

export interface IHistory {
  id?: number;
  type?: string;
  updatedTime?: string | null;
  updatedBy?: string | null;
  entityName?: string | null;
  entityId?: number | null;
}

export const defaultValue: Readonly<IHistory> = {};
