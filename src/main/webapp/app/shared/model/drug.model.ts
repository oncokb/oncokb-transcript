import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';

export interface IDrug {
  id?: number;
  name?: string | null;
  code?: string | null;
  semanticType?: string | null;
  drugSynonyms?: IDrugSynonym[] | null;
}

export const defaultValue: Readonly<IDrug> = {};
