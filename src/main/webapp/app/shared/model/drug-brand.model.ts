import { IDrug } from 'app/shared/model/drug.model';
import { GeographicRegion } from 'app/shared/model/enumerations/geographic-region.model';

export interface IDrugBrand {
  id?: number;
  name?: string | null;
  region?: GeographicRegion | null;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IDrugBrand> = {};
