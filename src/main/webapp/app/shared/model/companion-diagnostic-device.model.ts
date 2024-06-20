import dayjs from 'dayjs';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { ISpecimenType } from 'app/shared/model/specimen-type.model';

// CrudStore cannot use interface
export type ICompanionDiagnosticDevice = {
  id?: number;
  name?: string;
  manufacturer?: string;
  indicationDetails?: string | null;
  platformType?: string | null;
  lastUpdated?: string | null;
  fdaSubmissions?: IFdaSubmission[] | null;
  specimenTypes?: ISpecimenType[] | null;
};

export const defaultValue: Readonly<ICompanionDiagnosticDevice> = {};
