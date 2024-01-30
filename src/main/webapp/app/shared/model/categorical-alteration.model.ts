import { IConsequence } from 'app/shared/model/consequence.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface ICategoricalAlteration {
  id?: number;
  alterationType?: AlterationType;
  type?: string;
  name?: string;
  consequence?: IConsequence | null;
}

export const defaultValue: Readonly<ICategoricalAlteration> = {};
