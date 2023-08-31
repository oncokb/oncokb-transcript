import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { IBiomarkerAssociation } from 'app/shared/model/biomarker-association.model';
import { IFlag } from 'app/shared/model/flag.model';
import { IAlteration } from 'app/shared/model/alteration.model';

export interface IGene {
  id?: number;
  entrezGeneId?: number | null;
  hugoSymbol?: string | null;
  hgncId?: string | null;
  geneAliases?: IGeneAlias[] | null;
  ensemblGenes?: IEnsemblGene[] | null;
  biomarkerAssociations?: IBiomarkerAssociation[] | null;
  flags?: IFlag[] | null;
  alterations?: IAlteration[] | null;
}

export const defaultValue: Readonly<IGene> = {};
