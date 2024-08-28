import { Gene as GenePayload } from 'app/shared/api/generated/core';
import { Gene } from 'app/shared/model/firebase/firebase.model';

export function createGeneTypePayload(
  gene: Pick<Gene, 'name'> & { type: Pick<Gene['type'], 'ocg' | 'tsg'> },
): Required<Pick<GenePayload, 'hugoSymbol' | 'oncogene' | 'tsg'>> {
  return {
    hugoSymbol: gene.name,
    oncogene: gene.type.ocg ? true : false,
    tsg: gene.type.tsg ? true : false,
  };
}
export function removeGenePayload(gene: Pick<Gene, 'name'>): Required<Pick<GenePayload, 'hugoSymbol'>> {
  return {
    hugoSymbol: gene.name,
  };
}

export function isGeneTypeChange(path: string): boolean {
  return path.startsWith('type');
}
