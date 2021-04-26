import { IDrug } from 'app/shared/model/drug.model';

export interface IDrugSynonym {
  id?: number;
  name?: string | null;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IDrugSynonym> = {};
