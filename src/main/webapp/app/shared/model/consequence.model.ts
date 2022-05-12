import { IAlteration } from 'app/shared/model/alteration.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface IConsequence {
  id?: number;
  type?: AlterationType;
  term?: string;
  name?: string;
  isGenerallyTruncating?: boolean;
  description?: string | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<IConsequence> = {
  isGenerallyTruncating: false,
};
