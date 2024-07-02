import dayjs from 'dayjs';
import { IArticle } from 'app/shared/model/article.model';
import { IAssociation } from 'app/shared/model/association.model';
import { ICompanionDiagnosticDevice } from 'app/shared/model/companion-diagnostic-device.model';
import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { IFdaSubmissionType } from 'app/shared/model/fda-submission-type.model';

export interface IFdaSubmission {
  id: number;
  number: string;
  supplementNumber: string;
  deviceName: string;
  genericName: string | null;
  dateReceived: string | null;
  decisionDate: string | null;
  description: string | null;
  curated: boolean;
  genetic: boolean;
  note: string | null;
  articles: IArticle[] | null;
  associations: IAssociation[] | null;
  companionDiagnosticDevice: ICompanionDiagnosticDevice | null;
  fdaDrug: IFdaDrug | null;
  type: IFdaSubmissionType | null;
}
