import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { FdaSubmissionTypeKey } from 'app/shared/model/enumerations/fda-submission-type-key.model';

export interface IFdaSubmissionType {
  id?: number;
  key?: FdaSubmissionTypeKey;
  name?: string;
  shortName?: string | null;
  description?: string | null;
  fdaSubmissions?: IFdaSubmission[] | null;
}

export const defaultValue: Readonly<IFdaSubmissionType> = {};
