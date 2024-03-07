import { ONCOGENICITY, UUID_REGEX } from 'app/config/constants/constants';
import {
  Comment,
  Gene,
  Meta,
  Mutation,
  Review,
  TX_LEVELS,
  Tumor,
  Alteration,
  DX_LEVELS,
  PX_LEVELS,
  VusObjList,
  FIREBASE_ONCOGENICITY,
} from 'app/shared/model/firebase/firebase.model';
import { replaceUrlParams } from '../url-utils';
import { FB_COLLECTION_PATH } from 'app/config/constants/firebase';
import { parseFirebaseGenePath } from './firebase-path-utils';
import { NestLevelType, RemovableNestLevel } from 'app/pages/curation/collapsible/NestLevel';
import { IDrug } from 'app/shared/model/drug.model';
import { extractPositionFromSingleNucleotideAlteration, parseAlterationName } from '../utils';
import _ from 'lodash';
import { MutationLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import { CategoricalAlterationType } from 'app/shared/model/enumerations/categorical-alteration-type.model';

/* Convert a nested object into an object where the key is the path to the object.
  Example:
    {type: {ocg: 'Oncogene}, name: 'ABL1' }
    is converted to
    {'type/ocg': 'Oncogene', 'name': 'ABL1'}
*/
export const convertNestedObject = (obj: any, key = '', result = {}) => {
  if (obj === null) {
    return;
  }
  if (typeof obj !== 'object') {
    result[key] = obj;
    return result;
  }
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const newKey = key ? key + '/' + keys[i] : keys[i];
    convertNestedObject(obj[keys[i]], newKey, result);
  }

  return result;
};

export const getValueByNestedKey = (obj: any, nestedKey = '') => {
  return nestedKey.split('/').reduce((currObj, currKey) => {
    if (currObj) return currObj[currKey];
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
export const getMutationName = (mutation: Mutation) => {
  const defaultNoName = '(No Name)';
  if (mutation.alterations) {
    return mutation.alterations.map(alteration => getAlterationName(alteration)).join(', ');
  }
  if (mutation.name) {
    return mutation.name;
  } else {
    return defaultNoName;
  }
};

export const getTxName = (drugList: readonly IDrug[], txUuidName: string) => {
  return txUuidName
    .split(',')
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
    .join(', ');
};

export const geneNeedsReview = (meta: Meta | undefined) => {
  let needsReview = false;
  const metaReview = meta?.review;
  if (metaReview) {
    needsReview = !!Object.keys(metaReview).find(key => UUID_REGEX.test(key));
  }
  return needsReview;
};

export const getFirebasePath = (type: keyof typeof FB_COLLECTION_PATH, ...params: (string | number)[]) => {
  return replaceUrlParams(FB_COLLECTION_PATH[type], ...params);
};

export function getMostRecentComment(comments: Comment[]) {
  let latestComment = comments[0];
  for (const comment of comments) {
    if (parseInt(comment.date, 10) > parseInt(latestComment.date, 10)) {
      latestComment = comment;
    }
  }
  return latestComment;
}

export const isSectionRemovableWithoutReview = (geneData: Gene, nestLevel: RemovableNestLevel, fullPath: string) => {
  let reviewKey;
  if (nestLevel === NestLevelType.MUTATION || nestLevel === NestLevelType.THERAPY) {
    reviewKey = 'name_review';
  } else {
    reviewKey = 'cancerTypes_review';
  }

  const pathDetails = parseFirebaseGenePath(fullPath);

  const review: Review = getValueByNestedKey(geneData, `${pathDetails.pathFromGene}/${reviewKey}`);
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

export const isSectionEmpty = (geneData: Gene, fullPath: string) => {
  const path = parseFirebaseGenePath(fullPath).pathFromGene;
  const value = getValueByNestedKey(geneData, path);
  if (value === undefined) {
    return true;
  }

  const ignoredKeySuffixes = ['_review', '_uuid', 'TIs', 'cancerTypes'];
  const isEmpty = isNestedObjectEmpty(value, ignoredKeySuffixes);

  if (!isEmpty) {
    return isEmpty;
  }

  // If the section is not empty, we still need to check if there are treatments in the TIs array.
  // We skipped the TIs key because TI.name and TI.type always has a value, which will
  // make our function always return isEmpty=False
  if (path.match(/tumors\/\d+$/g)) {
    const implications = (value as Tumor).TIs;
    for (const implication of implications) {
      if (implication.treatments && implication.treatments.length > 0) {
        return false;
      }
    }
  }
  return isEmpty;
};

export const isPendingDelete = (geneData: Gene, nestLevel: RemovableNestLevel, path: string) => {
  const key = parseFirebaseGenePath(path).pathFromGene;
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

const sortByIndex = (aIndex: number, bIndex: number, order: SortOrder = 'asc') => {
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

export const getDuplicateMutations = (
  currentMutations: string[],
  mutationList: Mutation[],
  vusList: VusObjList,
  options: { useFullAlterationName?: boolean; excludedUuid?: string; exact?: boolean }
) => {
  const mutationNames =
    mutationList
      ?.filter(mutation => options.excludedUuid !== mutation.name_uuid)
      .map(mutation =>
        mutation.name
          .split(',')
          .map(alt => {
            const parsedAlteration = parseAlterationName(alt)[0];
            const variantName = parsedAlteration.name ? ` [${parsedAlteration.name}]` : '';
            const excluding = parsedAlteration.excluding.length > 0 ? ` {excluding ${parsedAlteration.excluding.join(' ; ')}}` : '';
            if (options.useFullAlterationName) {
              return `${parsedAlteration.alteration}${variantName}${excluding}`.toLowerCase();
            }
            return parsedAlteration.alteration.toLowerCase();
          })
          .sort()
      ) || [];

  const vusNames = Object.values(vusList || []).map(vus => {
    return parseAlterationName(vus.name).map(parsedVus => parsedVus.alteration.toLowerCase());
  });

  const jointNames = [...mutationNames, ...vusNames];
  const duplicates = new Set<string>();
  if (options.exact) {
    if (jointNames.some(mutation => _.isEqual(mutation, currentMutations))) {
      duplicates.add(currentMutations.join(', '));
    }
  } else {
    const flattenedJointNames = _.uniq(_.flatten(jointNames));
    currentMutations.filter(currAlt => flattenedJointNames.includes(currAlt.toLowerCase())).forEach(mutation => duplicates.add(mutation));
  }
  return duplicates;
};

export const isMutationEffectCuratable = (mutationName: string) => {
  if (mutationName.includes(',')) {
    return false;
  }
  const excludedMutations = ['Oncogenic Mutations'];
  return excludedMutations.filter(mutation => mutationName.toLowerCase().includes(mutation.toLowerCase())).length === 0;
};

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

export function compareMutationsByTxLevel(mut1: Mutation, mut2: Mutation, mutationLevelSummary: MutationLevelSummary) {
  const mut1Levels = Object.keys(mutationLevelSummary[mut1.name_uuid]?.txLevels || []).sort(sortByTxLevel);
  const mut2Levels = Object.keys(mutationLevelSummary[mut2.name_uuid]?.txLevels || []).sort(sortByTxLevel);

  let index = 0;
  while (mut1Levels[index] || mut2Levels[index]) {
    if (!mut1Levels[index]) {
      return 1;
    } else if (!mut2Levels[index]) {
      return -1;
    }

    const order = sortByTxLevel(mut1Levels[index] as TX_LEVELS, mut2Levels[index] as TX_LEVELS);
    if (order !== 0) {
      return order;
    }

    index++;
  }

  return 0;
}

export function compareMutationsByHasDxOrPx(mut1: Mutation, mut2: Mutation, mutationLevelSummary: MutationLevelSummary) {
  const mut1HasDxOrPx = mutationLevelSummary[mut1.name_uuid].DxS > 0 || mutationLevelSummary[mut1.name_uuid].PxS > 0;
  const mut2HasDxOrPx = mutationLevelSummary[mut2.name_uuid].DxS > 0 || mutationLevelSummary[mut2.name_uuid].PxS > 0;

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

  return compareFirebaseOncogenicities(
    mut1.mutation_effect.oncogenic as FIREBASE_ONCOGENICITY,
    mut2.mutation_effect.oncogenic as FIREBASE_ONCOGENICITY
  );
}

export function compareMutationsBySingleAlteration(mut1: Mutation, mut2: Mutation) {
  const mut1Alterations = mut1.name.split(',');
  const mut2Alterations = mut2.name.split(',');

  if (mut1Alterations.length === 1 && mut2Alterations.length === 1) {
    return 0;
  } else if (mut1Alterations.length > 1) {
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

  return Number(mut1Position) - Number(mut2Position);
}

export function compareMutationsByCategoricalAlteration(mut1: Mutation, mut2: Mutation) {
  const mut1IsCategorical = Object.values(CategoricalAlterationType).some(
    categorical => categorical.toLowerCase() === mut1.name.toLowerCase()
  );
  const mut2IsCategorical = Object.values(CategoricalAlterationType).some(
    categorical => categorical.toLowerCase() === mut2.name.toLowerCase()
  );

  if ((mut1IsCategorical && mut2IsCategorical) || (!mut1IsCategorical && !mut2IsCategorical)) {
    return 0;
  } else if (mut1IsCategorical) {
    return -1;
  } else if (mut2IsCategorical) {
    return 1;
  }
}

export function compareMutations(mut1: Mutation, mut2: Mutation, mutationLevelSummary: MutationLevelSummary) {
  let order = compareMutationsByDeleted(mut1, mut2);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByTxLevel(mut1, mut2, mutationLevelSummary);
  if (order !== 0) {
    return order;
  }

  order = compareMutationsByHasDxOrPx(mut1, mut2, mutationLevelSummary);
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

  return mut1.name.localeCompare(mut2.name);
}
