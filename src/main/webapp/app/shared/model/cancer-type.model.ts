import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { TumorForm } from 'app/shared/model/enumerations/tumor-form.model';

export interface ICancerType {
  id?: number;
  code?: string | null;
  color?: string | null;
  level?: number;
  mainType?: string;
  subtype?: string | null;
  tissue?: string | null;
  tumorForm?: TumorForm;
  children?: ICancerType[] | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
  parent?: ICancerType | null;
}

export const defaultValue: Readonly<ICancerType> = {};
