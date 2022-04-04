import dayjs from 'dayjs';
import { IDeviceUsageIndication } from 'app/shared/model/device-usage-indication.model';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';

export interface IFdaSubmission {
  id?: number;
  number?: string;
  supplementNumber?: string | null;
  deviceName?: string | null;
  genericName?: string | null;
  dateReceived?: string | null;
  decisionDate?: string | null;
  description?: string | null;
  deviceUsageIndications?: IDeviceUsageIndication[] | null;
  companionDiagnosticDevice?: ICompanionDiagnosticDevice | null;
  type?: IFdaSubmissionType | null;
}

export const defaultValue: Readonly<IFdaSubmission> = {};
