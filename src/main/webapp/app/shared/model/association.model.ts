import { IAssociationCancerType } from 'app/shared/model/association-cancer-type.model';
import { IAlteration } from 'app/shared/model/alteration.model';
import { IArticle } from 'app/shared/model/article.model';
import { ITreatment } from 'app/shared/model/treatment.model';
import { IEvidence } from 'app/shared/model/evidence.model';
import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { IClinicalTrialArm } from 'app/shared/model/clinical-trial-arm.model';
import { IEligibilityCriteria } from 'app/shared/model/eligibility-criteria.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';

export interface IAssociation {
  id?: number;
  name?: string | null;
  associationCancerTypes?: IAssociationCancerType[] | null;
  alterations?: IAlteration[] | null;
  articles?: IArticle[] | null;
  treatments?: ITreatment[] | null;
  evidence?: IEvidence | null;
  clinicalTrials?: IClinicalTrial[] | null;
  clinicalTrialArms?: IClinicalTrialArm[] | null;
  eligibilityCriteria?: IEligibilityCriteria[] | null;
  fdaSubmissions?: IFdaSubmission[] | null;
  genomicIndicators?: IGenomicIndicator[] | null;
}

export const defaultValue: Readonly<IAssociation> = {};
