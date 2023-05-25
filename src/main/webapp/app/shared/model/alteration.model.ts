import { IAlterationReferenceGenome } from 'app/shared/model/alteration-reference-genome.model';
import { IGene } from 'app/shared/model/gene.model';
import { IConsequence } from 'app/shared/model/consequence.model';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';

export interface IAlteration {
  id?: number;
  name?: string;
  alteration?: string;
  proteinStart?: number | null;
  proteinEnd?: number | null;
  refResidues?: string | null;
  variantResidues?: string | null;
  referenceGenomes?: IAlterationReferenceGenome[] | null;
  genes?: IGene[] | null;
  consequence?: IConsequence | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
}

export const defaultValue: Readonly<IAlteration> = {};
