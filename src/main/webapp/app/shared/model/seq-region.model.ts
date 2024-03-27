import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IGenomeFragment } from 'app/shared/model/genome-fragment.model';

export interface ISeqRegion {
  id?: number;
  name?: string;
  chromosome?: string | null;
  description?: string | null;
  ensemblGenes?: IEnsemblGene[] | null;
  genomeFragments?: IGenomeFragment[] | null;
}

export const defaultValue: Readonly<ISeqRegion> = {};
