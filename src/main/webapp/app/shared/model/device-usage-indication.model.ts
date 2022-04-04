import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IDrug } from 'app/shared/model/drug.model';

export interface IDeviceUsageIndication {
  id?: number;
  fdaSubmission?: IFdaSubmission | null;
  alteration?: IAlteration | null;
  cancerType?: ICancerType | null;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IDeviceUsageIndication> = {};
