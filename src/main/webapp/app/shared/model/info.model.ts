import dayjs from 'dayjs';
import { InfoType } from 'app/shared/model/enumerations/info-type.model';

export interface IInfo {
  id?: number;
  type?: InfoType;
  value?: string | null;
  lastUpdated?: string | null;
}

export const defaultValue: Readonly<IInfo> = {};
