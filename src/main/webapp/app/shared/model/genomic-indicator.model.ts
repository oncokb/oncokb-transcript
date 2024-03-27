import { IAlleleState } from 'app/shared/model/allele-state.model';
import { IAssociation } from 'app/shared/model/association.model';

export interface IGenomicIndicator {
  id?: number;
  uuid?: string;
  type?: string;
  name?: string;
  description?: string | null;
  alleleStates?: IAlleleState[] | null;
  associations?: IAssociation[] | null;
}

export const defaultValue: Readonly<IGenomicIndicator> = {};
