import _ from 'lodash';
import { Drug, Gene, Mutation, Review, Treatment, Tumor, Vus, DrugCollection } from '../../model/firebase/firebase.model';

export function getGeneData(geneData: Gene, excludeComments: boolean, onlyReviewedContent: boolean, drugList: DrugCollection): true | Gene {
  const gene = _.cloneDeep(geneData);
  processData(gene, ['summary', 'background'], excludeComments, onlyReviewedContent);
  processData(gene.type, ['tsg', 'ocg'], excludeComments, onlyReviewedContent);
  const tempMutations: Mutation[] = [];
  for (const mutation of gene.mutations ?? []) {
    const tempTumors: Tumor[] = [];
    if (shouldExclude(onlyReviewedContent, mutation.name_review)) {
      tempMutations.push(mutation);
      continue;
    }
    processData(mutation, ['name'], excludeComments, onlyReviewedContent);
    processData(mutation.mutation_effect, ['oncogenic', 'effect', 'description'], excludeComments, onlyReviewedContent);
    for (const tumor of mutation.tumors ?? []) {
      if (shouldExclude(onlyReviewedContent, tumor.cancerTypes_review)) {
        tempTumors.push(tumor);
        continue;
      }
      // process tumor cancerTypes
      processData(tumor, ['summary', 'diagnosticSummary', 'prognosticSummary'], excludeComments, onlyReviewedContent);
      processData(tumor.diagnostic, ['level', 'description', 'relevantCancerTypes'], excludeComments, onlyReviewedContent);
      processData(tumor.prognostic, ['level', 'description', 'relevantCancerTypes'], excludeComments, onlyReviewedContent);
      for (const ti of tumor.TIs) {
        processData(ti, ['description'], excludeComments, onlyReviewedContent);
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
            ['level', 'propagation', 'propagationLiquid', 'indication', 'description'],
            excludeComments,
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

function processData(data: object | undefined, keys: string[], excludeComments: boolean, onlyReviewedContent: boolean) {
  if (data !== undefined) {
    for (const key of keys) {
      if (excludeComments) {
        delete data[key + '_comments'];
      }
      const reviewKey = key + '_review';
      const maybeReview = data[reviewKey];
      if (onlyReviewedContent && typeof maybeReview === 'object' && maybeReview !== null && 'lastReviewed' in maybeReview) {
        data[key] = maybeReview.lastReviewed;
      }
    }
  }
}

export function getVUSData(vus: Vus[], excludeComments: boolean) {
  const vusData = _.cloneDeep(vus);
  const vusDataArray = [];
  excludeComments = _.isBoolean(excludeComments) ? excludeComments : false;
  for (const vusItem of vusData) {
    if (excludeComments) {
      delete vusItem.name_comments;
    }
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
      return element.trim().split(' + ');
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
    params.gene = JSON.stringify(getGeneData(gene, true, true, drugList));
  }
  if (vus) {
    params.vus = JSON.stringify(getVUSData(vus, true));
  }
  return params;
}