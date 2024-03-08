import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { IFlag } from 'app/shared/model/flag.model';
import { IAssociation } from 'app/shared/model/association.model';

export interface IDrug {
  id?: number;
  uuid?: string;
  name?: string;
  nciThesaurus?: INciThesaurus | null;
  fdaDrugs?: IFdaDrug[] | null;
  flags?: IFlag[] | null;
  associations?: IAssociation[] | null;
}

export const defaultValue: Readonly<IDrug> = {};
