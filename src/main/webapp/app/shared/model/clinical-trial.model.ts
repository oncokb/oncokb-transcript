import { IClinicalTrialArm } from 'app/shared/model/clinical-trial-arm.model';
import { IEligibilityCriteria } from 'app/shared/model/eligibility-criteria.model';
import { IAssociation } from 'app/shared/model/association.model';

export interface IClinicalTrial {
  id: number;
  nctId: string | null;
  briefTitle: string;
  phase: string | null;
  status: string | null;
  clinicalTrialArms: IClinicalTrialArm[] | null;
  eligibilityCriteria: IEligibilityCriteria[] | null;
  associations: IAssociation[] | null;
}
