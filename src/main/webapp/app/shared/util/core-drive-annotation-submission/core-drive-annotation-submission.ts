import _ from 'lodash';
import { Drug, Gene, Mutation, Review, Treatment, Tumor, Vus, DrugCollection } from '../../model/firebase/firebase.model';

export function getGeneData(geneData: Gene, onlyReviewedContent: boolean, drugList: DrugCollection): true | Gene {
  const gene = _.cloneDeep(geneData);
  processData(gene, ['summary', 'background'], onlyReviewedContent);
  processData(gene.type, ['tsg', 'ocg'], onlyReviewedContent);
  const tempMutations: Mutation[] = [];
  for (const mutation of gene.mutations ?? []) {
    const tempTumors: Tumor[] = [];
    if (shouldExclude(onlyReviewedContent, mutation.name_review)) {
      tempMutations.push(mutation);
      continue;
    }
    processData(mutation, ['name'], onlyReviewedContent);
    processData(mutation.mutation_effect, ['oncogenic', 'effect', 'description'], onlyReviewedContent);
    for (const tumor of mutation.tumors ?? []) {
      if (shouldExclude(onlyReviewedContent, tumor.cancerTypes_review)) {
        tempTumors.push(tumor);
        continue;
      }
      // process tumor cancerTypes
      processData(tumor, ['summary', 'diagnosticSummary', 'prognosticSummary'], onlyReviewedContent);
      processData(tumor.diagnostic, ['level', 'description', 'excludedRCTs'], onlyReviewedContent);
      processData(tumor.prognostic, ['level', 'description', 'excludedRCTs'], onlyReviewedContent);
      for (const ti of tumor.TIs) {
        type TempTreatment = Omit<Treatment, 'name'> & { name: ReturnType<typeof drugUuidToDrug> | string };
        const tempTreatments: TempTreatment[] = [];
        for (const treatment of ti.treatments ?? []) {
          if (shouldExclude(onlyReviewedContent, treatment.name_review)) {
            tempTreatments.push(treatment);
            return true;
          }
          (treatment as TempTreatment).name = drugUuidToDrug(treatment.name, drugList);
          processData(
            treatment,
            ['level', 'propagation', 'propagationLiquid', 'indication', 'description', 'fdaLevel'],
            onlyReviewedContent,
          );
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

function processData<T, K extends keyof T & string>(data: T | undefined, keys: K[], onlyReviewedContent: boolean) {
  if (data !== undefined) {
    for (const key of keys) {
      delete data[key + '_comments'];
      const reviewKey = key + '_review';
      const maybeReview = data[reviewKey];
      if (onlyReviewedContent && typeof maybeReview === 'object' && maybeReview !== null && 'lastReviewed' in maybeReview) {
        data[key] = maybeReview.lastReviewed;
      }
    }
  }
}

export function getVUSData(vus: Vus[]) {
  const vusData = _.cloneDeep(vus);
  const vusDataArray = [];
  for (const vusItem of vusData) {
    delete vusItem.name_comments;
    vusDataArray.push(vusItem);
  }
  return vusDataArray;
}

function shouldExclude(onlyReviewedContent: boolean, reviewObj: Review | undefined) {
  return reviewObj && ((onlyReviewedContent && reviewObj.added === true) || (!onlyReviewedContent && reviewObj.removed === true));
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
      return drugList[key];
    });
  });
}

export type DriveAnnotation = { gene: string | undefined; vus: string | undefined };
export function getDriveAnnotations(drugList: DrugCollection, { gene, vus }: { gene: Gene; vus: Vus[] }): DriveAnnotation {
  const params: DriveAnnotation = { gene: undefined, vus: undefined };
  if (gene) {
    params.gene = JSON.stringify(getGeneData(gene, true, drugList));
  }
  if (vus) {
    params.vus = JSON.stringify(getVUSData(vus));
  }
  return params;
}
