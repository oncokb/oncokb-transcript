import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { ISpecimenType } from 'app/shared/model/specimen-type.model';

export interface ICompanionDiagnosticDevice {
  id?: number;
  name?: string;
  manufacturer?: string;
  indicationDetails?: string | null;
  fdaSubmissions?: IFdaSubmission[] | null;
  specimenTypes?: ISpecimenType[] | null;
}

export const defaultValue: Readonly<ICompanionDiagnosticDevice> = {};
