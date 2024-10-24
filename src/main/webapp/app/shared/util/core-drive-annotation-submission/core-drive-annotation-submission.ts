import _ from 'lodash';
import { Drug, Gene, Mutation, Review, Treatment, Tumor, Vus, DrugCollection } from '../../model/firebase/firebase.model';
import { useLastReviewedOnly } from '../core-submission-shared/core-submission-utils';

export function getGeneData(geneData: Gene, drugList: DrugCollection): Gene | undefined {
  const gene = useLastReviewedOnly(geneData);
  if (gene === undefined) {
    return undefined;
  }
  processData(gene, ['summary', 'background']);
  processData(gene.type, ['tsg', 'ocg']);
  const tempMutations: Mutation[] = [];
  for (const mutation of gene.mutations ?? []) {
    const tempTumors: Tumor[] = [];
    if (shouldExclude(mutation.name_review)) {
      tempMutations.push(mutation);
      continue;
    }
    processData(mutation, ['name']);
    processData(mutation.mutation_effect, ['oncogenic', 'effect', 'description']);
    for (const tumor of mutation.tumors ?? []) {
      if (shouldExclude(tumor.cancerTypes_review)) {
        tempTumors.push(tumor);
        continue;
      }
      // process tumor cancerTypes
      processData(tumor, ['summary', 'diagnosticSummary', 'prognosticSummary']);
      processData(tumor.diagnostic, ['level', 'description', 'excludedRCTs']);
      processData(tumor.prognostic, ['level', 'description', 'excludedRCTs']);
      for (const ti of tumor.TIs) {
        type TempTreatment = Omit<Treatment, 'name'> & { name: ReturnType<typeof drugUuidToDrug> | string };
        const tempTreatments: TempTreatment[] = [];
        for (const treatment of ti.treatments ?? []) {
          if (shouldExclude(treatment.name_review)) {
            tempTreatments.push(treatment);
            return undefined;
          }
          (treatment as TempTreatment).name = drugUuidToDrug(treatment.name, drugList);
          processData(treatment, ['level', 'propagation', 'propagationLiquid', 'indication', 'description', 'fdaLevel']);
        }
        for (const item of tempTreatments) {
          const index = ti.treatments.indexOf(item as Treatment);
          if (index !== -1) {
            ti.treatments.splice(index, 1);
          }
        }
      }
    }
    for (const tumor of tempTumors) {
      const index = mutation.tumors.indexOf(tumor);
      if (index !== -1) {
        mutation.tumors.splice(index, 1);
      }
    }
  }
  for (const mutation of tempMutations) {
    const index = gene.mutations.indexOf(mutation);
    if (index !== -1) {
      gene.mutations.splice(index, 1);
    }
  }
  return gene;
}

function processData<T, K extends keyof T & string>(data: T | undefined, keys: K[]) {
  if (data !== undefined) {
    for (const key of keys) {
      delete data?.[key + '_comments'];
      const reviewKey = key + '_review';
      const maybeReview: Review | null | undefined = data?.[reviewKey];
      if (data !== null && typeof maybeReview === 'object' && maybeReview !== null) {
        if (maybeReview.added) {
          delete data[key];
        } else if ('lastReviewed' in maybeReview) {
          data[key] = maybeReview.lastReviewed as (T & object)[K];
        }
      }
    }
  }
}

export function getVUSData(vus: Vus[]) {
  const vusData = _.cloneDeep(vus);
  const vusDataArray: Vus[] = [];
  for (const vusItem of vusData) {
    delete vusItem.name_comments;
    vusDataArray.push(vusItem);
  }
  return vusDataArray;
}

function shouldExclude(reviewObj: Review | undefined) {
  /* initialUpdate is true when it is the first time updating excludedRCTs field.
   * Normally for string fields, we set lastReviewed: "" to empty string.
   * The "lastReviewed" for excludedRCTs is empty array, which cannot be stored
   * into firebase, so we created this initialUpdate field to denote that.
   * */
  return reviewObj && (reviewObj.added === true || reviewObj.promotedToMutation === true || reviewObj.initialUpdate === true);
}

function drugUuidToDrug(key: string | undefined, drugList: DrugCollection): Drug[][] | Record<string, unknown> {
  if (key !== undefined) {
    const keys = therapyStrToArr(key);
    return getDrugsByUuids(keys, drugList);
  } else {
    return {};
  }
}

function therapyStrToArr(key: string) {
  if (key) {
    return key.split(',').map(function (element) {
      return element
        .trim()
        .split('+')
        .map(x => x.trim());
    });
  } else {
    return [];
  }
}

function getDrugsByUuids(keys: string[][], drugList: DrugCollection): Drug[][] {
  return keys.map(function (element) {
    return element.map(function (key) {
      if (!drugList[key]) {
        throw new Error(`Cannot find drug for ${key}`);
      }
      return drugList[key];
    });
  });
}

export type DriveAnnotation = { gene: string | undefined; vus: string | undefined; releaseGene: boolean };
export function getDriveAnnotations(
  drugList: DrugCollection,
  { gene, vus, releaseGene }: { gene: Gene | undefined; vus: Vus[] | undefined; releaseGene: boolean },
): DriveAnnotation {
  const params: DriveAnnotation = { gene: undefined, vus: undefined, releaseGene: false };
  if (gene !== undefined) {
    const geneData = getGeneData(gene, drugList);
    if (geneData !== undefined) {
      params.gene = JSON.stringify(geneData);
    }
  }
  if (vus !== undefined) {
    params.vus = JSON.stringify(getVUSData(vus));
  }
  if (releaseGene) {
    params.releaseGene = releaseGene;
  }
  return params;
}
