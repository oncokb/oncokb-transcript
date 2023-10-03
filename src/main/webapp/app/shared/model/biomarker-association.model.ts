import { IAlteration } from 'app/shared/model/alteration.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IGene } from 'app/shared/model/gene.model';

export interface IBiomarkerAssociation {
  id?: number;
  alterations?: IAlteration[] | null;
  drugs?: IDrug[] | null;
  fdaSubmissions?: IFdaSubmission[] | null;
  cancerType?: ICancerType | null;
  gene?: IGene | null;
}

export const defaultValue: Readonly<IBiomarkerAssociation> = {};
