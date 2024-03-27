import { IAlteration } from 'app/shared/model/alteration.model';

export interface IVariantConsequence {
  id?: number;
  term?: string;
  isGenerallyTruncating?: boolean;
  description?: string | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<IVariantConsequence> = {
  isGenerallyTruncating: false,
};
