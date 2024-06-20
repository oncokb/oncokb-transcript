import { IAlleleState } from 'app/shared/model/allele-state.model';
import { IAssociation } from 'app/shared/model/association.model';

// CrudStore cannot use interface
export type IGenomicIndicator = {
  id?: number;
  uuid?: string;
  type?: string;
  name?: string;
  description?: string | null;
  alleleStates?: IAlleleState[] | null;
  associations?: IAssociation[] | null;
};

export const defaultValue: Readonly<IGenomicIndicator> = {};
