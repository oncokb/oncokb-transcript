import dayjs from 'dayjs';
import { IAssociation } from 'app/shared/model/association.model';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';

export interface IFdaSubmission {
  id?: number;
  number?: string;
  supplementNumber?: string;
  deviceName?: string;
  genericName?: string | null;
  dateReceived?: string | null;
  decisionDate?: string | null;
  description?: string | null;
  curated?: boolean;
  genetic?: boolean;
  note?: string | null;
  associations?: IAssociation[] | null;
  companionDiagnosticDevice?: ICompanionDiagnosticDevice | null;
  type?: IFdaSubmissionType | null;
}

export const defaultValue: Readonly<IFdaSubmission> = {
  curated: false,
  genetic: false,
};
