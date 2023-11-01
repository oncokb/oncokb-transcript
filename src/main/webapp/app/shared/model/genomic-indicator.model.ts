import { IAssociation } from 'app/shared/model/association.model';

export interface IGenomicIndicator {
  id?: number;
  type?: string;
  name?: string;
  associations?: IAssociation[] | null;
}

export const defaultValue: Readonly<IGenomicIndicator> = {};
