import { IAssociation } from 'app/shared/model/association.model';
import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';

export interface IClinicalTrialArm {
  id?: number;
  name?: string;
  associations?: IAssociation[] | null;
  clinicalTrial?: IClinicalTrial | null;
}

export const defaultValue: Readonly<IClinicalTrialArm> = {};
