import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';
import { IConsequence } from 'app/shared/model/consequence.model';

export interface ICategoricalAlteration {
  id?: number;
  alterationType?: AlterationType;
  type?: string;
  consequence?: IConsequence;
  name?: string;
}

export const defaultValue: Readonly<ICategoricalAlteration> = {};
