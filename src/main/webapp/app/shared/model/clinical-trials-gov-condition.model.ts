import { ICancerType } from 'app/shared/model/cancer-type.model';

export interface IClinicalTrialsGovCondition {
  id?: number;
  name?: string;
  cancerTypes?: ICancerType[] | null;
}

export const defaultValue: Readonly<IClinicalTrialsGovCondition> = {};
