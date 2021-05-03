import { IGeneAlias } from 'app/shared/model/gene-alias.model';

export interface IGene {
  id?: number;
  entrezGeneId?: number | null;
  hugoSymbol?: string | null;
  geneAliases?: IGeneAlias[] | null;
}

export const defaultValue: Readonly<IGene> = {};
