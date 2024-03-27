import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IDrug } from 'app/shared/model/drug.model';

export interface IFdaDrug {
  id?: number;
  applicationNumber?: string;
  sponsorName?: string | null;
  overallMarketingStatus?: string | null;
  fdaSubmissions?: IFdaSubmission[] | null;
  drug?: IDrug | null;
}

export const defaultValue: Readonly<IFdaDrug> = {};
