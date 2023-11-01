import { IDrug } from 'app/shared/model/drug.model';

export interface IDrugBrand {
  id?: number;
  name?: string;
  region?: string | null;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IDrugBrand> = {};
