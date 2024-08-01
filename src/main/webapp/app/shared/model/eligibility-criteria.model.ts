import { IAssociation } from 'app/shared/model/association.model';
import { IClinicalTrial } from 'app/shared/model/clinical-trial.model';
import { EligibilityCriteriaType } from 'app/shared/model/enumerations/eligibility-criteria-type.model';

export interface IEligibilityCriteria {
  id: number;
  type: EligibilityCriteriaType;
  priority: number | null;
  criteria: string | null;
  associations: IAssociation[] | null;
  clinicalTrial: IClinicalTrial | null;
}
