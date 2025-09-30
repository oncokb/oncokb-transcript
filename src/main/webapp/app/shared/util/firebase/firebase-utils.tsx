import { APP_EXPANDED_DATETIME_FORMAT, CURRENT_REVIEWER, NEW_NAME_UUID_VALUE } from 'app/config/constants/constants';
import { FB_COLLECTION, FB_COLLECTION_PATH } from 'app/config/constants/firebase';
import { NestLevelType, RemovableNestLevel } from 'app/pages/curation/collapsible/NestLevel';
import { IDrug } from 'app/shared/model/drug.model';
import { CategoricalAlterationType } from 'app/shared/model/enumerations/categorical-alteration-type.model';
import {
  Alteration,
  CancerType,
  CommentList,
  DX_LEVELS,
  FIREBASE_ONCOGENICITY,
  Gene,
  Meta,
  MetaReview,
  Mutation,
  MutationList,
  PX_LEVELS,
  Review,
  TI,
  Treatment,
  Tumor,
  TX_LEVELS,
  VusObjList,
} from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import React from 'react';
import { TextFormat } from 'react-jhipster';
import { replaceUrlParams } from '../url-utils';
import { extractPositionFromSingleNucleotideAlteration, getCancerTypeName, isUuid, parseAlterationName } from '../utils';
import { isTxLevelPresent } from './firebase-level-utils';
import { parseFirebaseGenePath } from './firebase-path-utils';
import { hasReview } from './firebase-review-utils';

export const getValueByNestedKey = (obj: any, nestedKey = '', sep = '/') => {
  return nestedKey.split(sep).reduce((currObj, currKey) => {
    if (currObj && typeof currObj === 'object') return currObj[currKey];
  }, obj);
};

export const isDnaVariant = (alteration: Alteration) => {
  return alteration.alteration && alteration.alteration.startsWith('c.');
};

export const getAlterationName = (alteration: Alteration) => {
  if (alteration.name) {
    let name = alteration.name;
    if (alteration.proteinChange && alteration.proteinChange !== alteration.alteration) {
      name += ` (p.${alteration.proteinChange})`;
    }
    return name;
  } else if (alteration.proteinChange) {
    return alteration.proteinChange;
  }
  return '';
};
export const getMutationName = (name: string | undefined, alterations: Alteration[] | null | undefined) => {
  const defaultNoName = '(No Name)';
  if (alterations) {
    return alterations.map(alteration => getAlterationName(alteration)).join(', ');
  }
  if (name) {
    return name;
  } else {
    return defaultNoName;
  }
};

export const getTxName = (drugList: readonly IDrug[], txUuidName: string | undefined) => {
  return (
    txUuidName
      ?.split(',')
      .map(tx => {
        return tx
          .split('+')
          .map(drug => {
            drug = drug.trim();
            const drugInList = drugList.find(d => d.uuid === drug);
            return drugInList ? drugInList.name : drug;
          })
          .join(' + ');
      })
      .join(', ') ?? ''
  );
};

export const geneNeedsReview = (meta: Meta | null | undefined) => {
  return geneMetaReviewHasNonNameUuids(meta?.review);
};

export const mutationNeedsReview = (mutation: Mutation, review: MetaReview) => {
  const ignoreNameChange = mutation.name_review?.added || false;
  const uuids = Object.keys(review).filter(key => key !== CURRENT_REVIEWER);

  let nestedObjects = [mutation];
  while (nestedObjects.length > 0) {
    const newNestedObjects: Mutation[] = [];

    for (const nestedObject of nestedObjects) {
      for (const [key, val] of Object.entries(nestedObject)) {
        if (key === 'name_uuid' || key === 'cancerTypes_uuid') {
          if (!ignoreNameChange && uuids.includes(val)) {
            return true;
          }
        } else if (key.endsWith('_uuid') && uuids.includes(val)) {
          return true;
        } else if (typeof val === 'object') {
          newNestedObjects.push(val);
        }
      }
    }

    nestedObjects = newNestedObjects;
  }
  return false;
};

export const geneMetaReviewHasNonNameUuids = (metaReview: MetaReview | undefined) => {
  let needsReview = false;
  if (metaReview) {
    needsReview = Object.entries(metaReview).some(([key, val]) => isUuid(key) && val !== NEW_NAME_UUID_VALUE);
  }
  return needsReview;
};

export const getFirebasePath = (type: keyof typeof FB_COLLECTION_PATH, ...params: (string | number | undefined)[]) => {
  return replaceUrlParams(FB_COLLECTION_PATH[type], ...params);
};

export const getFirebaseGenePath = (isGermline: boolean | undefined, hugoSymbol?: string) => {
  if (hugoSymbol !== undefined) {
    const basePath = isGermline ? 'GERMLINE_GENE' : 'GENE';
    return getFirebasePath(basePath, hugoSymbol);
  } else {
    return isGermline ? FB_COLLECTION.GERMLINE_GENES : FB_COLLECTION.GENES;
  }
};

export const getFirebaseMetaGenePath = (isGermline: boolean | undefined, hugoSymbol: string | undefined) => {
  return getFirebasePath(isGermline ? 'GERMLINE_META_GENE' : 'META_GENE', hugoSymbol);
};

export const getFirebaseHistoryPath = (isGermline: boolean | undefined, hugoSymbol: string | undefined) => {
  return getFirebasePath(isGermline ? 'GERMLINE_HISTORY' : 'HISTORY', hugoSymbol);
};

export const getFirebaseVusPath = (isGermline: boolean | undefined, hugoSymbol?: string) => {
  if (hugoSymbol !== undefined) {
    const basePath = isGermline ? 'GERMLINE_VUS' : 'VUS';
    return getFirebasePath(basePath, hugoSymbol);
  } else {
    return isGermline ? FB_COLLECTION.GERMLINE_VUS : FB_COLLECTION.VUS;
  }
};

export const getFirebaseMetaGeneReviewPath = (isGermline: boolean | undefined, hugoSymbol: string, uuid: string) => {
  return getFirebasePath(isGermline ? 'GERMLINE_META_GENE_REVIEW' : 'META_GENE_REVIEW', hugoSymbol, uuid);
};

export function getMostRecentComment(comments: CommentList) {
  const commentsArray = Object.values(comments);
  let latestComment = commentsArray[0];
  for (const comment of commentsArray) {
    if (parseInt(comment.date, 10) > parseInt(latestComment.date, 10)) {
      latestComment = comment;
    }
  }
  return latestComment;
}

export const isSectionRemovableWithoutReview = (review: Review | null | undefined) => {
  return !!review && !!review.added;
};

export function isNestedObjectEmpty(obj: any, ignoredKeySubstrings: string[] = []) {
  if (typeof obj === 'object' && obj !== undefined && obj !== null) {
    let targetKeys = Object.keys(obj);
    if (ignoredKeySubstrings !== undefined && ignoredKeySubstrings.length > 0) {
      targetKeys = Object.keys(obj).filter(key => !ignoredKeySubstrings.some(suffix => key.includes(suffix)));
    }
    let isEmpty = true;
    for (const key of targetKeys) {
      isEmpty = isEmpty && isNestedObjectEmpty(obj[key], ignoredKeySubstrings);
      if (!isEmpty) {
        return false;
      }
    }
    return true;
  }

  if (obj === undefined || obj === null) {
    return true;
  }

  if (typeof obj === 'string') {
    return obj.trim().length === 0;
  }

  if (Array.isArray(obj)) {
    return obj.length === 0;
  }

  return false;
}

export const isSectionEmpty = (sectionValue: any, fullPath: string) => {
  const path = parseFirebaseGenePath(fullPath)?.pathFromGene;
  if (sectionValue === undefined || path === undefined) {
    return true;
  }

  const ignoredKeySuffixes = ['_review', '_uuid', 'TIs', 'cancerTypes', 'excludedCancerTypes', 'name', 'alterations'];
  const isEmpty = isNestedObjectEmpty(sectionValue, ignoredKeySuffixes);

  if (!isEmpty) {
    return isEmpty;
  }

  // If the section is not empty, we still need to check if there are treatments in the TIs array.
  // We skipped the TIs key because TI.name and TI.type always has a value, which will
  // make our function always return isEmpty=False
  const implications: TI[] = [];
  if (path.match(/mutations\/[^/]+$/g)) {
    for (const tumor of Object.values((sectionValue as Mutation).tumors ?? {})) {
      implications.push(...tumor.TIs);
    }
  } else if (path.match(/tumors\/[^/]+$/g)) {
    implications.push(...(sectionValue as Tumor).TIs);
  }

  for (const implication of implications) {
    if (implication.treatments && Object.keys(implication.treatments).length > 0) {
      return false;
    }
  }
  return isEmpty;
};

export const isPendingDelete = (geneData: Gene, nestLevel: RemovableNestLevel, path: string) => {
  const key = parseFirebaseGenePath(path)?.pathFromGene;
  let reviewKey = key;
  if (nestLevel === NestLevelType.CANCER_TYPE) {
    reviewKey += '/cancerTypes_review';
  } else {
    reviewKey += '/name_review';
  }
  const review = getValueByNestedKey(geneData, reviewKey);
  if ((review as Review)?.removed) {
    return true;
  }
  return false;
};

export type SortOrder = 'asc' | 'desc';

export const sortByIndex = (aIndex: number, bIndex: number, order: SortOrder = 'asc') => {
  if (aIndex === bIndex) {
    return 0;
  }
  if (aIndex === -1) {
    return 1;
  }
  if (bIndex === -1) {
    return -1;
  }

  if (order === 'asc') {
    return aIndex > bIndex ? 1 : -1;
  } else {
    return aIndex < bIndex ? 1 : -1;
  }
};

export const sortByTxLevel = (a: TX_LEVELS, b: TX_LEVELS, order: SortOrder = 'asc') => {
  const ordering = [
    TX_LEVELS.LEVEL_1,
    TX_LEVELS.LEVEL_R1,
    TX_LEVELS.LEVEL_2,
    TX_LEVELS.LEVEL_3A,
    TX_LEVELS.LEVEL_3B,
    TX_LEVELS.LEVEL_4,
    TX_LEVELS.LEVEL_R2,
  ];
  const aIndex = ordering.indexOf(a);
  const bIndex = ordering.indexOf(b);
  return sortByIndex(aIndex, bIndex, order);
};

export const sortByDxLevel = (a: DX_LEVELS, b: DX_LEVELS, order: SortOrder = 'asc') => {
  const ordering = [DX_LEVELS.LEVEL_DX1, DX_LEVELS.LEVEL_DX2, DX_LEVELS.LEVEL_DX3];
  const aIndex = ordering.indexOf(a);
  const bIndex = ordering.indexOf(b);
  return sortByIndex(aIndex, bIndex, order);
};

export const sortByPxLevel = (a: PX_LEVELS, b: PX_LEVELS, order: SortOrder = 'asc') => {
  const ordering = [PX_LEVELS.LEVEL_PX1, PX_LEVELS.LEVEL_PX2, PX_LEVELS.LEVEL_PX3];
  const aIndex = ordering.indexOf(a);
  const bIndex = ordering.indexOf(b);
  return sortByIndex(aIndex, bIndex, order);
};

export const compareFirebaseOncogenicities = (a: FIREBASE_ONCOGENICITY, b: FIREBASE_ONCOGENICITY, order: SortOrder = 'asc') => {
  const samePriority = [FIREBASE_ONCOGENICITY.YES, FIREBASE_ONCOGENICITY.LIKELY, FIREBASE_ONCOGENICITY.RESISTANCE];

  const aIsInSamePriority = samePriority.includes(a);
  const bIsInSamePriority = samePriority.includes(b);
  if (aIsInSamePriority && bIsInSamePriority) {
    return 0;
  } else if (aIsInSamePriority) {
    return order === 'asc' ? -1 : 1;
  } else if (bIsInSamePriority) {
    return order === 'asc' ? 1 : -1;
  }

  const ordering = [FIREBASE_ONCOGENICITY.LIKELY_NEUTRAL, FIREBASE_ONCOGENICITY.INCONCLUSIVE, FIREBASE_ONCOGENICITY.UNKNOWN];

  const aIndex = ordering.indexOf(a);
  const bIndex = ordering.indexOf(b);
  return sortByIndex(aIndex, bIndex, order);
};

export const getVusTimestampClass = (time: string | number) => {
  const vusTime = new Date(time);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthDiff = (year - vusTime.getFullYear()) * 12 + month - vusTime.getMonth();
  if (monthDiff > 6) {
    return 'danger';
  } else if (monthDiff > 3) {
    return 'warning';
  } else {
    return '';
  }
};

export type DuplicateMutationInfo =
  | {
      duplicate: string;
      inMutationList: true;
      inVusList: boolean;
      firebaseMutationPath: string;
    }
  | {
      duplicate: string;
      inMutationList: false;
      inVusList: boolean;
    };

export const getDuplicateMutations = (
  currentMutations: string[],
  mutationList: MutationList | undefined | null,
  firebaseMutationListPath: string,
  vusList: VusObjList | undefined | null,
  options: { useFullAlterationName?: boolean; excludedMutationUuid?: string; excludedVusName?: string; exact?: boolean },
) => {
  const mutationNames =
    Object.entries(mutationList ?? {})
      ?.filter(([mKey, mutation]) => options.excludedMutationUuid !== mutation.name_uuid)
      .map(([mKey, mutation]) => ({
        mutationName: mutation.name
          ?.split(',')
          .map(alt => {
            const parsedAlteration = parseAlterationName(alt)[0];
            const variantName = parsedAlteration.name ? ` [${parsedAlteration.name}]` : '';
            const excluding = parsedAlteration.excluding.length > 0 ? ` {excluding ${parsedAlteration.excluding.join(' ; ')}}` : '';
            let mutationName = parsedAlteration.alteration.toLowerCase();
            if (options.useFullAlterationName) {
              mutationName = `${parsedAlteration.alteration}${variantName}${excluding}`.toLowerCase();
            }
            return mutationName;
          })
          .sort(),
        firebaseMutationPath: `${firebaseMutationListPath}/${mKey}`,
      })) || [];

  const vusNames = Object.values(vusList || [])
    .filter(vus => vus.name.toLowerCase() !== options.excludedVusName?.toLowerCase())
    .map(vus => {
      return parseAlterationName(vus.name).map(parsedVus => parsedVus.alteration.toLowerCase());
    });

  const duplicates: DuplicateMutationInfo[] = [];
  if (options.exact) {
    const currentMutationsName = currentMutations.join(', ');
    const lowerCaseCurrentMutations = currentMutations.map(mut => mut.toLowerCase());

    const matchingMutation = mutationNames.find(mutation => _.isEqual(mutation.mutationName, lowerCaseCurrentMutations));

    if (matchingMutation) {
      addDuplicateMutationInfo(duplicates, currentMutationsName, 'mutation', matchingMutation.firebaseMutationPath);
    }

    const matchingVUS = vusNames.find(vus => _.isEqual(vus, lowerCaseCurrentMutations));

    if (matchingVUS) {
      addDuplicateMutationInfo(duplicates, currentMutationsName, 'vus');
    }
  } else {
    const flattenedMutationNames = _.uniq(
      mutationNames.flatMap(group =>
        group.mutationName.map(name => ({
          mutationName: name,
          firebaseMutationList: group.firebaseMutationPath,
        })),
      ),
    );

    currentMutations.forEach(currAlt => {
      flattenedMutationNames.forEach(fmn => {
        if (fmn.mutationName === currAlt.toLowerCase()) {
          addDuplicateMutationInfo(duplicates, fmn.mutationName, 'mutation', fmn.firebaseMutationList);
        }
      });
    });
  }
  return duplicates;
};

const addDuplicateMutationInfo = (
  duplicates: DuplicateMutationInfo[],
  mutationName: string,
  listType: 'mutation' | 'vus',
  firebaseMutationPath?: string,
) => {
  const existingDuplicate = duplicates.find(duplicate => duplicate.duplicate === mutationName);
  if (existingDuplicate) {
    if (listType === 'mutation' && firebaseMutationPath) {
      // Cast to narrow the type so TypeScript knows we can assign firebaseMutationPath
      Object.assign(existingDuplicate, {
        inMutationList: true,
        firebaseMutationPath,
      });
    } else {
      existingDuplicate.inVusList = true;
    }
  } else {
    if (listType === 'mutation' && firebaseMutationPath) {
      duplicates.push({
        duplicate: mutationName,
        inMutationList: true,
        inVusList: false,
        firebaseMutationPath,
      });
    } else {
      duplicates.push({
        duplicate: mutationName,
        inMutationList: false,
        inVusList: true,
      });
    }
  }
};

export const hasMultipleMutations = (mutationName: string) => {
  return mutationName.includes(',');
};
export const isMutationEffectCuratable = (mutationName: string) => {
  const multipleMuts = hasMultipleMutations(mutationName);
  if (multipleMuts && !areSameAlterationsWithDifferentReferenceGenomes(mutationName)) {
    return false;
  }
  const excludedMutations = ['Oncogenic Mutations'];
  return excludedMutations.filter(mutation => mutationName.toLowerCase().includes(mutation.toLowerCase())).length === 0;
};

function areSameAlterationsWithDifferentReferenceGenomes(mutationName: string) {
  const alterations = mutationName.split(',');

  if (alterations.length !== 2) {
    return false;
  }

  const alt1 = alterations[0].trim().toLowerCase();
  const alt2 = alterations[1].trim().toLowerCase();
  const grch37Prefix = 'grch37:';
  const grch38Prefix = 'grch38:';

  if (
    (alt1.startsWith(grch37Prefix) && alt2.startsWith(grch38Prefix)) ||
    (alt1.startsWith(grch38Prefix) && alt2.startsWith(grch37Prefix))
  ) {
    return true;
  }
  return false;
}

export function compareMutationsByDeleted(mut1: Mutation, mut2: Mutation) {
  const mut1IsDeleted = mut1.name_review?.removed || false;
  const mut2IsDeleted = mut2.name_review?.removed || false;

  if ((mut1IsDeleted && mut2IsDeleted) || (!mut1IsDeleted && !mut2IsDeleted)) {
    return 0;
  } else if (mut1IsDeleted) {
    return 1;
  } else {
    return -1;
  }
}

export function compareMutationsByTxLevel(mut1: Mutation, mut2: Mutation) {
  const mut1Levels = (Object.keys(getMutationStats(mut1).txLevels) as TX_LEVELS[]).sort(sortByTxLevel);
  const mut2Levels = (Object.keys(getMutationStats(mut2).txLevels) as TX_LEVELS[]).sort(sortByTxLevel);

  let index = 0;
  while (mut1Levels[index] || mut2Levels[index]) {
    if (!mut1Levels[index]) {
      return 1;
    } else if (!mut2Levels[index]) {
      return -1;
    }

    const order = sortByTxLevel(mut1Levels[index], mut2Levels[index]);
    if (order !== 0) {
      return order;
    }

    index++;
  }

  return 0;
}

export function compareMutationsByHasDxOrPx(mut1: Mutation, mut2: Mutation) {
  const mut1Stats = getMutationStats(mut1);
  const mut1HasDxOrPx = mut1Stats.DxS > 0 || mut1Stats.PxS > 0;

  const mut2Stats = getMutationStats(mut2);
  const mut2HasDxOrPx = mut2Stats.DxS > 0 || mut2Stats.PxS > 0;

  if ((mut1HasDxOrPx && mut2HasDxOrPx) || (!mut1HasDxOrPx && !mut2HasDxOrPx)) {
    return 0;
  } else if (mut1HasDxOrPx) {
    return -1;
  } else {
    return 1;
  }
}

export function compareMutationsByOncogenicity(mut1: Mutation, mut2: Mutation) {
  const mut1Oncogenicity = mut1.mutation_effect.oncogenic;
  const mut2Oncogenicity = mut2.mutation_effect.oncogenic;

  if (!mut1Oncogenicity && !mut2Oncogenicity) {
    return 0;
  } else if (!mut1Oncogenicity) {
    return 1;
  } else if (!mut2Oncogenicity) {
    return -1;
  }

  return compareFirebaseOncogenicities(mut1Oncogenicity, mut2Oncogenicity);
}

export function compareMutationsBySingleAlteration(mut1: Mutation, mut2: Mutation) {
  const mut1AlterationLength = mut1.name.split(',').length;
  const mut2AlterationLength = mut2.name.split(',').length;

  if (mut1AlterationLength === 1 && mut2AlterationLength === 1) {
    return 0;
  } else if (mut1AlterationLength > 1 && mut2AlterationLength > 1) {
    return 0;
  } else if (mut1AlterationLength > 1) {
    return 1;
  } else {
    return -1;
  }
}

export function compareMutationsByProteinChangePosition(mut1: Mutation, mut2: Mutation) {
  const mut1Position = extractPositionFromSingleNucleotideAlteration(mut1.name);
  const mut2Position = extractPositionFromSingleNucleotideAlteration(mut2.name);

  if (!mut1Position && !mut2Position) {
    return 0;
  } else if (!mut1Position) {
    return 1;
  } else if (!mut2Position) {
    return -1;
  }

  const mut1PosInt = Number(mut1Position);
  const mut2PosInt = Number(mut2Position);

  if (mut1PosInt < mut2PosInt) {
    return -1;
  } else if (mut1PosInt > mut2PosInt) {
    return 1;
  }
  return 0;
}

export function compareMutationsByCategoricalAlteration(mut1: Mutation, mut2: Mutation) {
  const mut1IsCategorical = Object.values(CategoricalAlterationType).some(
    categorical => categorical.toLowerCase() === mut1.name?.toLowerCase(),
  );
  const mut2IsCategorical = Object.values(CategoricalAlterationType).some(
    categorical => categorical.toLowerCase() === mut2.name?.toLowerCase(),
  );

  if ((mut1IsCategorical && mut2IsCategorical) || (!mut1IsCategorical && !mut2IsCategorical)) {
    return 0;
  } else if (mut1IsCategorical) {
    return -1;
  } else if (mut2IsCategorical) {
    return 1;
  } else {
    return 0;
  }
}

export function getMutationModifiedTimestamp(mutation: Mutation): number | null {
  let modifiedTime: number | null = null;
  let nestedObjects = [mutation];
  while (nestedObjects.length > 0) {
    const newNestedObjects: Mutation[] = [];

    for (const nestedObject of nestedObjects) {
      for (const [key, val] of Object.entries(nestedObject)) {
        if (key.endsWith('_review')) {
          const review = val as Review;
          if (modifiedTime === null) {
            modifiedTime = review.updateTime;
          } else {
            modifiedTime = Math.max(review.updateTime, modifiedTime);
          }
        } else if (typeof val === 'object') {
          newNestedObjects.push(val);
        }
      }
    }

    nestedObjects = newNestedObjects;
  }
  return modifiedTime;
}

export function compareMutationsByLastModified(mut1: Mutation, mut2: Mutation, order: SortOrder = 'desc') {
  const mutation1LastModified = getMutationModifiedTimestamp(mut1);
  const mutation2LastModified = getMutationModifiedTimestamp(mut2);
  if (mutation1LastModified == null && mutation2LastModified == null) {
    return 0;
  } else if (mutation1LastModified === null) {
    return order === 'asc' ? -1 : 1;
  } else if (mutation2LastModified === null) {
    return order === 'asc' ? 1 : -1;
  } else if (order === 'asc') {
    return mutation1LastModified - mutation2LastModified;
  } else {
    return mutation2LastModified - mutation1LastModified;
  }
}

export function compareMutationsByName(mut1: Mutation, mut2: Mutation, order: SortOrder = 'asc') {
  const comparison = getMutationName(mut1.name, mut1.alterations).localeCompare(getMutationName(mut2.name, mut2.alterations));
  return order === 'asc' ? comparison : comparison * -1;
}

export function compareMutationsDefault(mut1: Mutation, mut2: Mutation) {
  let order = compareMutationsByDeleted(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByTxLevel(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByHasDxOrPx(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByOncogenicity(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsBySingleAlteration(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByProteinChangePosition(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByCategoricalAlteration(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  return compareMutationsByName(mut1, mut2);
}

export const getFilterModalStats = (mutations: readonly Mutation[]) => {
  const oncogencities: FIREBASE_ONCOGENICITY[] = [];
  const mutationEffects: string[] = [];
  const txLevels: TX_LEVELS[] = [];

  const mutationStats = mutations?.map(mutation => getMutationStats(mutation)) || [];
  for (const stat of mutationStats) {
    if (stat.oncogenicity && !oncogencities.includes(stat.oncogenicity)) {
      oncogencities.push(stat.oncogenicity);
    }

    if (stat.mutationEffect && !mutationEffects.includes(stat.mutationEffect)) {
      mutationEffects.push(stat.mutationEffect);
    }

    for (const txLevel of Object.keys(stat.txLevels)) {
      if (txLevel && !txLevels.includes(txLevel as TX_LEVELS)) {
        // exclude empty
        txLevels.push(txLevel as TX_LEVELS);
      }
    }
  }

  return {
    oncogencities,
    mutationEffects,
    txLevels,
  };
};

export type AllLevelSummary = {
  [mutationUuid: string]: {
    [cancerTypesUuid: string]: {
      TT: number;
      oncogenicity: FIREBASE_ONCOGENICITY | '';
      TTS: number;
      DxS: number;
      PxS: number;
      txLevels: TX_LEVELS[];
      dxLevels: DX_LEVELS[];
      pxLevels: PX_LEVELS[];
      treatmentSummary: { [treatmentId: string]: TX_LEVELS[] };
    };
  };
};

export const getAllLevelSummaryStats = (mutations: Mutation[]) => {
  const summary: AllLevelSummary = {};
  mutations.forEach(mutation => {
    summary[mutation.name_uuid] = {};
    if (mutation.tumors) {
      Object.values(mutation.tumors).forEach(tumor => {
        summary[mutation.name_uuid][tumor.cancerTypes_uuid] = {
          TT: 0,
          oncogenicity: '',
          TTS: 0,
          DxS: 0,
          PxS: 0,
          txLevels: [],
          dxLevels: [],
          pxLevels: [],
          treatmentSummary: {},
        };
        summary[mutation.name_uuid][tumor.cancerTypes_uuid].TT++;
        summary[mutation.name_uuid][tumor.cancerTypes_uuid].oncogenicity = mutation.mutation_effect.oncogenic;
        if (tumor.summary) {
          summary[mutation.name_uuid][tumor.cancerTypes_uuid].TTS++;
        }
        if (tumor.diagnosticSummary) {
          summary[mutation.name_uuid][tumor.cancerTypes_uuid].DxS++;
        }
        if (tumor.prognosticSummary) {
          summary[mutation.name_uuid][tumor.cancerTypes_uuid].PxS++;
        }
        tumor.TIs.forEach(ti => {
          if (ti.treatments) {
            Object.values(ti.treatments).forEach(treatment => {
              const cancerTypeSummary = summary[mutation.name_uuid][tumor.cancerTypes_uuid];
              cancerTypeSummary.txLevels.push(treatment.level);

              if (!cancerTypeSummary.treatmentSummary[treatment.name_uuid]) {
                cancerTypeSummary.treatmentSummary[treatment.name_uuid] = [];
              }
              cancerTypeSummary.treatmentSummary[treatment.name_uuid].push(treatment.level);
            });
          }
        });
        if (tumor?.diagnostic?.level) {
          summary[mutation.name_uuid][tumor.cancerTypes_uuid].dxLevels.push(tumor.diagnostic.level as DX_LEVELS);
        }
        if (tumor?.prognostic?.level) {
          summary[mutation.name_uuid][tumor.cancerTypes_uuid].pxLevels.push(tumor.prognostic.level as PX_LEVELS);
        }
      });
    }
  });
  return summary;
};

// Todo: The stats need to be refactored
export const getMutationStats = (
  mutation: Mutation,
): {
  TT: number;
  oncogenicity: '' | FIREBASE_ONCOGENICITY | undefined;
  mutationEffect: string | undefined;
  TTS: number;
  DxS: number;
  PxS: number;
  txLevels: { [txLevel in TX_LEVELS]: number };
  dxLevels: { [dxLevel in DX_LEVELS]: number };
  pxLevels: { [pxLevel in PX_LEVELS]: number };
} => {
  const stats = {
    TT: 0,
    oncogenicity: mutation?.mutation_effect.oncogenic,
    mutationEffect: mutation?.mutation_effect.effect,
    TTS: 0,
    DxS: 0,
    PxS: 0,
    txLevels: {} as { [txLevel in TX_LEVELS]: number },
    dxLevels: {} as { [dxLevel in DX_LEVELS]: number },
    pxLevels: {} as { [pxLevel in PX_LEVELS]: number },
  };
  if (mutation?.tumors) {
    Object.values(mutation.tumors).forEach(tumor => {
      stats.TT++;
      if (tumor.summary) {
        stats.TTS++;
      }
      if (tumor.diagnosticSummary) {
        stats.DxS++;
      }
      if (tumor.prognosticSummary) {
        stats.PxS++;
      }
      tumor.TIs.forEach(ti => {
        if (ti.treatments) {
          Object.values(ti.treatments).forEach(treatment => {
            if (isTxLevelPresent(treatment.level)) {
              if (!stats.txLevels[treatment.level]) {
                stats.txLevels[treatment.level] = 1;
              } else {
                stats.txLevels[treatment.level]++;
              }
            }
          });
        }
      });
      if (tumor?.diagnostic?.level) {
        if (!stats.dxLevels[tumor.diagnostic.level]) {
          stats.dxLevels[tumor.diagnostic.level] = 1;
        } else {
          stats.dxLevels[tumor.diagnostic.level]++;
        }
      }
      if (tumor?.prognostic?.level) {
        if (!stats.dxLevels[tumor.prognostic.level]) {
          stats.pxLevels[tumor.prognostic.level] = 1;
        } else {
          stats.pxLevels[tumor.prognostic.level]++;
        }
      }
    });
  }
  return stats;
};

export const getCancerTypeStats = (tumor?: Tumor | null) => {
  const stats = {
    TT: 0,
    TTS: 0,
    DxS: 0,
    PxS: 0,
    txLevels: {} as { [txLevel in TX_LEVELS]: number },
    dxLevels: {} as { [dxLevel in DX_LEVELS]: number },
    pxLevels: {} as { [pxLevel in PX_LEVELS]: number },
  };

  if (tumor) {
    if (tumor.summary) {
      stats.TTS++;
    }
    if (tumor.diagnosticSummary) {
      stats.DxS++;
    }
    if (tumor.prognosticSummary) {
      stats.PxS++;
    }
    tumor.TIs.forEach(ti => {
      if (ti.treatments) {
        Object.values(ti.treatments).forEach(treatment => {
          if (isTxLevelPresent(treatment.level)) {
            if (!stats.txLevels[treatment.level]) {
              stats.txLevels[treatment.level] = 1;
            } else {
              stats.txLevels[treatment.level]++;
            }
          }
        });
      }
    });
    if (tumor.diagnostic?.level) {
      if (!stats.dxLevels[tumor.diagnostic.level]) {
        stats.dxLevels[tumor.diagnostic.level] = 1;
      } else {
        stats.dxLevels[tumor.diagnostic.level]++;
      }
    }
    if (tumor.prognostic?.level) {
      if (!stats.dxLevels[tumor.prognostic.level]) {
        stats.pxLevels[tumor.prognostic.level] = 1;
      } else {
        stats.pxLevels[tumor.prognostic.level]++;
      }
    }
  }
  return stats;
};

export const getTreatmentStats = (treatment?: Treatment) => {
  const stats = {
    TT: 0,
    TTS: 0,
    DxS: 0,
    PxS: 0,
    txLevels: {} as { [txLevel in TX_LEVELS]: number },
    dxLevels: {} as { [dxLevel in DX_LEVELS]: number },
    pxLevels: {} as { [pxLevel in PX_LEVELS]: number },
  };
  if (isTxLevelPresent(treatment?.level)) {
    stats.txLevels[treatment.level] = 1;
  }
  return stats;
};

export const getReviewInfo = (editor: string, action: string, updateTime?: string) => {
  const baseText = `${action} by ${editor}`;
  let timeComponent: JSX.Element | undefined = undefined;
  if (updateTime) {
    timeComponent = (
      <>
        <span> on </span>
        <TextFormat value={updateTime} type="date" format={APP_EXPANDED_DATETIME_FORMAT} />
      </>
    );
  }
  return (
    <span style={{ fontSize: '90%' }}>
      {baseText}
      {timeComponent}
    </span>
  );
};

export const getAllCommentsString = (comments: CommentList) => {
  return Object.values(comments)
    .map(comment => comment.content)
    .join('\n');
};

export function findNestedUuids(obj: any, uuids: string[] = []) {
  // Base case: if the input is not an object, return
  if (typeof obj !== 'object' || obj === null) {
    return uuids;
  }

  // Iterate through each key in the object
  for (const key of Object.keys(obj)) {
    if (key.endsWith('_review') && hasReview(obj[key])) {
      // If the key ends with "_review" and has reviewable content, add the corresponding "_uuid" key to the result array
      const uuidKey = key.slice(0, -7) + '_uuid';
      if (obj[uuidKey]) {
        uuids.push(obj[uuidKey]);
      }
    }
    // If the value is an object, recursively call the function
    if (typeof obj[key] === 'object') {
      findNestedUuids(obj[key], uuids);
    }
  }

  return uuids;
}

export function areCancerTypeArraysEqual(a: CancerType[], b: CancerType[]) {
  if (a.length !== b.length) return false;
  a.sort((ct1, ct2) => {
    return getCancerTypeName(ct1, false).localeCompare(getCancerTypeName(ct2, false));
  });
  b.sort((ct1, ct2) => {
    return getCancerTypeName(ct1, false).localeCompare(getCancerTypeName(ct2, false));
  });
  for (let i = 0; i < a.length; i++) {
    if (!areCancerTypePropertiesEqual(a[i].code, b[i].code)) return false;
    if (!areCancerTypePropertiesEqual(a[i].mainType, b[i].mainType)) return false;
    if (!areCancerTypePropertiesEqual(a[i].subtype, b[i].subtype)) return false;
  }
  return true;
}

export function areCancerTypePropertiesEqual(a: string | undefined, b: string | undefined) {
  if (a === b) return true;
  return isStringEmpty(a) && isStringEmpty(b);
}

export function isStringEmpty(string: string | undefined | null) {
  return string === '' || _.isNil(string);
}
