import { IAlteration } from 'app/shared/model/alteration.model';
import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';

export interface IConsequence {
  id?: number;
  term?: string;
  name?: string;
  isGenerallyTruncating?: boolean;
  description?: string | null;
  alterations?: IAlteration[] | null;
  categoricalAlterations?: ICategoricalAlteration[] | null;
}

export const defaultValue: Readonly<IConsequence> = {
  isGenerallyTruncating: false,
};
