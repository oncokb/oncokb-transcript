import { Gene as GenePayload } from 'app/shared/api/generated/core';
import { Gene } from 'app/shared/model/firebase/firebase.model';
import { useLastReviewedOnly } from '../core-submission-shared/core-submission-utils';

export function createGeneTypePayload(
  originalGene: Pick<Gene, 'name'> & { type: Pick<Gene['type'], 'ocg' | 'ocg_review' | 'tsg' | 'tsg_review'> },
): Required<Pick<GenePayload, 'hugoSymbol' | 'oncogene' | 'tsg'>> {
  const gene = useLastReviewedOnly(originalGene);
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
