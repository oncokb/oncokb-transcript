import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IAlteration } from 'app/shared/model/alteration.model';

export interface IGene {
  id?: number;
  entrezGeneId?: number | null;
  hugoSymbol?: string | null;
  geneAliases?: IGeneAlias[] | null;
  ensemblGenes?: IEnsemblGene[] | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<IGene> = {};
