import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';
import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';

export interface IDrug {
  id?: number;
  name?: string | null;
  code?: string | null;
  semanticType?: string | null;
  fdaDrug?: IFdaDrug | null;
  synonyms?: IDrugSynonym[] | null;
  brands?: IDrugBrand[] | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
}

export const defaultValue: Readonly<IDrug> = {};
