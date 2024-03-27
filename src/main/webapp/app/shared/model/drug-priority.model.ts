import { IDrug } from 'app/shared/model/drug.model';

export interface IDrugPriority {
  id?: number;
  priority?: number;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IDrugPriority> = {};
