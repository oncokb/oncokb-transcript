import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';

export interface IDrug {
  id?: number;
  name?: string | null;
  code?: string | null;
  semanticType?: string | null;
  synonyms?: IDrugSynonym[] | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
}

export const defaultValue: Readonly<IDrug> = {};