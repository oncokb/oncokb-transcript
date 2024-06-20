import { IConsequence } from 'app/shared/model/consequence.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

// CrudStore cannot use an interface
export type ICategoricalAlteration = {
  id?: number;
  alterationType?: AlterationType;
  type?: string;
  name?: string;
  consequence?: IConsequence | null;
};

export const defaultValue: Readonly<ICategoricalAlteration> = {};
