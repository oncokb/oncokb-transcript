import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { IGene } from 'app/shared/model/gene.model';
import { IVariantConsequence } from 'app/shared/model/variant-consequence.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface IAlteration {
  id?: number;
  type?: AlterationType;
  name?: string;
  alteration?: string;
  proteinStart?: number | null;
  proteinEnd?: number | null;
  refResidues?: string | null;
  variantResidues?: string | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
  genes?: IGene[] | null;
  consequence?: IVariantConsequence | null;
}

export const defaultValue: Readonly<IAlteration> = {};
