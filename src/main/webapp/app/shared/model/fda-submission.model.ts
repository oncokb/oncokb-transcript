import dayjs from 'dayjs';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';
import { IBiomarkerAssociation } from 'app/shared/model/biomarker-association.model';

export interface IFdaSubmission {
  id?: number;
  number?: string;
  supplementNumber?: string | null;
  deviceName?: string | null;
  genericName?: string | null;
  dateReceived?: string | null;
  decisionDate?: string | null;
  description?: string | null;
  platform?: string | null;
  curated?: boolean;
  genetic?: boolean;
  additionalInfo?: string | null;
  companionDiagnosticDevice?: ICompanionDiagnosticDevice | null;
  type?: IFdaSubmissionType | null;
  biomarkerAssociations?: IBiomarkerAssociation[] | null;
}

export const defaultValue: Readonly<IFdaSubmission> = {
  curated: false,
  genetic: false,
};
