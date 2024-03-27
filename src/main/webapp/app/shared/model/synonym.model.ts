import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IGene } from 'app/shared/model/gene.model';
import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';

export interface ISynonym {
  id?: number;
  type?: string;
  source?: string;
  code?: string | null;
  name?: string | null;
  note?: string | null;
  cancerTypes?: ICancerType[] | null;
  genes?: IGene[] | null;
  nciThesauruses?: INciThesaurus[] | null;
}

export const defaultValue: Readonly<ISynonym> = {};
