import { IDrug } from './drug.model';
import { IFdaSubmission } from './fda-submission.model';
import { IAlteration } from './alteration.model';
import { ICancerType } from './cancer-type.model';
import { IGene } from './gene.model';

export interface IDeviceUsageIndication {
  id?: number;
  alterations?: IAlteration[] | null;
  drugs?: IDrug[] | null;
  fdaSubmission?: IFdaSubmission[] | null;
  cancerType?: ICancerType | null;
  gene?: IGene | null;
}

export const defaultValue: Readonly<IDeviceUsageIndication> = {};
