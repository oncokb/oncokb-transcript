import {
  CancerType,
  Gene,
  GenomicIndicator,
  HistoryInfo,
  HistoryRecordState,
  Implication,
  Mutation,
  Review,
  TI,
  Treatment,
  Tumor,
} from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { generateUuid, getCancerTypesName, getCancerTypesNameWithExclusion } from '../utils';
import { getMutationName, getTxName } from './firebase-utils';
import { FB_COLLECTION, READABLE_FIELD, ReviewAction, ReviewLevelType } from 'app/config/constants/firebase';
import { IDrug } from 'app/shared/model/drug.model';
import React from 'react';
import { makeFirebaseKeysReadable } from './firebase-history-utils';
import { ICancerType } from 'app/shared/model/cancer-type.model';

export enum ReviewSectionTitlePrefix {
  CANCER_TYPE = 'Cancer Type',
  THERAPY = 'Therapy',
}

export interface ReviewChildren {
  [key: string]: BaseReviewLevel;
}

export type BaseReviewLevelParams = {
  reviewLevelType: ReviewLevelType;
  title: string;
  children?: ReviewChildren;
  valuePath: string;
  historyLocation: string;
  historyInfo: HistoryInfo;
  nestedUnderCreateorDelete?: boolean;
};
export class BaseReviewLevel {
  id: string; // id is used to uniquely identify a review level
  hideLevel: boolean;
  reviewLevelType: ReviewLevelType;
  title: string;
  children?: ReviewChildren;
  valuePath: string;
  historyLocation: string;
  historyInfo: HistoryInfo;
  nestedUnderCreateOrDelete?: boolean;

  constructor({
    reviewLevelType,
    title,
    valuePath,
    historyLocation,
    nestedUnderCreateorDelete = false,
    historyInfo,
  }: BaseReviewLevelParams) {
    this.id = generateUuid();
    this.hideLevel = false;
    this.reviewLevelType = reviewLevelType;
    this.title = title;
    this.valuePath = valuePath;
    this.historyLocation = historyLocation;
    this.nestedUnderCreateOrDelete = nestedUnderCreateorDelete;
    this.children = {};
    this.historyInfo = historyInfo;
  }

  hasChildren() {
    return !_.isEmpty(this.children);
  }

  childrenCount() {
    return Object.keys(this.children).length;
  }

  addChild(childReview: BaseReviewLevel) {
    this.children[childReview.title] = childReview;

    if (!childReview.historyInfo.mutation && this.historyInfo?.mutation) {
      childReview.historyInfo.mutation = this.historyInfo.mutation;
    }
    if (!childReview.historyInfo.cancerType && this.historyInfo?.cancerType) {
      childReview.historyInfo.cancerType = this.historyInfo.cancerType;
    }
    if (!childReview.historyInfo.treatment && this.historyInfo?.treatment) {
      childReview.historyInfo.treatment = this.historyInfo.treatment;
    }
  }
}

export type MetaReviewLevelParams = Omit<BaseReviewLevelParams, 'reviewLevelType'>;
export class MetaReviewLevel extends BaseReviewLevel {
  constructor(params: MetaReviewLevelParams) {
    super({ reviewLevelType: ReviewLevelType.META, ...params });
  }
}

export type MultiSelectionReviewLevelParams = Omit<BaseReviewLevelParams, 'reviewLevelType'>;
export class MultiSelectionReviewLevel extends BaseReviewLevel {
  reviewAction = ReviewAction.UPDATE;
  constructor(baseReviewLevelParams: MultiSelectionReviewLevelParams) {
    super({ reviewLevelType: ReviewLevelType.REVIEWABLE_MULTI, ...baseReviewLevelParams });
  }

  getReviewLevels() {
    return Object.values(this.children) as ReviewLevel[];
  }
}

export type ReviewInfo = {
  reviewPath: string;
  review: Review;
  lastReviewedString: string;
  uuid: string;
  reviewAction?: ReviewAction;
};

export type HistoryData = {
  oldState?: HistoryRecordState;
  newState?: HistoryRecordState;
};

export type ReviewLevelParams = Omit<BaseReviewLevelParams, 'reviewLevelType'> & {
  currentVal: any;
  reviewInfo: ReviewInfo;
  historyData: HistoryData;
};

export class ReviewLevel extends BaseReviewLevel {
  currentVal: any;
  reviewInfo: ReviewInfo;
  historyData: HistoryData;

  constructor({ currentVal, reviewInfo, historyData, ...baseReviewLevelParams }: ReviewLevelParams) {
    super({ ...baseReviewLevelParams, reviewLevelType: ReviewLevelType.REVIEWABLE });
    this.currentVal = currentVal;
    this.reviewInfo = reviewInfo;
    this.reviewInfo.reviewAction = getReviewAction(reviewInfo.review, reviewInfo.reviewPath);
    this.historyData = historyData;
  }
}

export type TumorReviewLevelParams = {
  currentExcludedCancerTypes?: ICancerType[];
  excludedCancerTypesReviewInfo?: ReviewInfo;
} & ReviewLevelParams;
export class TumorReviewLevel extends ReviewLevel {
  currentExcludedCancerTypes: ICancerType[];
  excludedCancerTypesReviewInfo: ReviewInfo;

  constructor({ currentExcludedCancerTypes, excludedCancerTypesReviewInfo, ...reviewLevelParams }: TumorReviewLevelParams) {
    super({ ...reviewLevelParams });
    this.excludedCancerTypesReviewInfo = excludedCancerTypesReviewInfo;
    this.currentExcludedCancerTypes = currentExcludedCancerTypes;
  }
}

export const getReviewAction = (review: Review, reviewPath: string): ReviewAction => {
  if (review.demotedToVus) {
    return ReviewAction.DEMOTE_MUTATION;
  }
  if (review.promotedToMutation) {
    return ReviewAction.PROMOTE_VUS;
  }
  if (review.added) {
    return ReviewAction.CREATE;
  }
  if (review.removed) {
    return ReviewAction.DELETE;
  }
  if (reviewPath.endsWith('cancerTypes_review') || reviewPath.endsWith('name_review')) {
    return ReviewAction.NAME_CHANGE;
  }
  return ReviewAction.UPDATE;
};

export interface RelevantKeys {
  fieldKey: string;
  reviewKey: string;
  uuidKey: string;
}

export const getRelevantKeysFromUuidKey = (uuidKey: string) => {
  const lastUnderscoreIndex = uuidKey.lastIndexOf('_');
  const fieldKey = uuidKey.substring(0, lastUnderscoreIndex);
  const reviewKey = fieldKey + '_review';
  const relevantKeys: RelevantKeys = {
    fieldKey,
    reviewKey,
    uuidKey,
  };
  return relevantKeys;
};

export const joinPathParts = (parentPath: string, ...pathParts: string[]) => {
  let parts = [];
  if (parentPath !== '') {
    parts.push(parentPath);
  }
  parts = parts.concat(pathParts);
  return parts.join('/');
};

export const removeLeafNodes = (parentReview: BaseReviewLevel) => {
  for (const key of Object.keys(parentReview.children)) {
    const childReview = parentReview.children[key];
    if (childReview.hasChildren()) continue;
    let shouldRemove = false;
    if (childReview.reviewLevelType === ReviewLevelType.META) {
      shouldRemove = true;
    }
    if (childReview.reviewLevelType === ReviewLevelType.REVIEWABLE) {
      const reviewLevel = childReview as ReviewLevel;

      const reviewTitle = reviewLevel.title;
      let showGenomicIndicatorReview = false;
      if (reviewTitle.includes(READABLE_FIELD.GENOMIC_INDICATORS)) {
        const reviewTitleParts = reviewTitle.split('/');
        if (reviewTitleParts[reviewTitleParts.length - 1]?.trim().length > 0) {
          showGenomicIndicatorReview = true;
        }
      }

      // If a new entity is created, we don't show in review mode until at least one field has been updated
      shouldRemove = isCreateReview(reviewLevel) && !reviewLevel.hasChildren() && !showGenomicIndicatorReview;
    }
    if (shouldRemove) {
      delete parentReview.children[key];
    }
  }
};

export const isCreateReview = (review: BaseReviewLevel) => {
  if (review.reviewLevelType === ReviewLevelType.REVIEWABLE) {
    const reviewLevel = review as ReviewLevel;
    return [ReviewAction.CREATE, ReviewAction.PROMOTE_VUS].includes(reviewLevel.reviewInfo.reviewAction);
  }
  return false;
};

export const isDeleteReview = (review: BaseReviewLevel) => {
  if (review.reviewLevelType === ReviewLevelType.REVIEWABLE) {
    const reviewLevel = review as ReviewLevel;
    return [ReviewAction.DELETE, ReviewAction.DEMOTE_MUTATION].includes(reviewLevel.reviewInfo.reviewAction);
  }
  return false;
};

export const getCompactReviewInfo = (review: BaseReviewLevel) => {
  if (review.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI) return review;
  if (!review.hasChildren()) {
    return review;
  }
  const numOfChildren = review.childrenCount();
  if (numOfChildren > 1) {
    return review;
  }
  let childReview = Object.values(review.children)[0];
  if (childReview.nestedUnderCreateOrDelete) {
    if (isCreateReview(review)) {
      return review;
    }
  }
  childReview = getCompactReviewInfo(childReview);
  let titleParts = [review.title, childReview.title].filter(part => part !== '');
  if (titleParts.length > 1) {
    titleParts = titleParts.map(part => removeSectionTitlePrefix(part));
  }
  childReview.title = titleParts.join('/');
  childReview.nestedUnderCreateOrDelete = review.nestedUnderCreateOrDelete;
  return childReview;
};

export const addSectionTitlePrefix = (prefix: ReviewSectionTitlePrefix, title: string) => {
  return `${prefix}: ${title}`;
};

export const removeSectionTitlePrefix = (title: string) => {
  if ([ReviewSectionTitlePrefix.CANCER_TYPE, ReviewSectionTitlePrefix.THERAPY].some(prefix => title.includes(prefix))) {
    title = title.replace(/^.*?:\s*/, '').trim();
  }
  return title;
};

export const reformatReviewTitle = (baseReviewLevel: BaseReviewLevel) => {
  const reviewTitle = baseReviewLevel.title;
  const titleParts = reviewTitle.split('/');
  const isNonActionableLevel = baseReviewLevel.reviewLevelType === ReviewLevelType.META || baseReviewLevel.nestedUnderCreateOrDelete;
  if (isNonActionableLevel) {
    return <span className="fw-normal">{titleParts.join(' / ')}</span>;
  }
  const lastTitlePart = titleParts.pop();
  return (
    <>
      <span className="fw-normal">{titleParts.join(' / ')}</span>
      {titleParts.length > 0 && <span className="fw-normal"> / </span>}
      <span className="fw-bold">{lastTitlePart}</span>
    </>
  );
};

export const reviewLevelSortMethod = (a: BaseReviewLevel, b: BaseReviewLevel) => {
  const aReviewAction =
    a.reviewLevelType === ReviewLevelType.META
      ? undefined
      : a.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI
        ? (a as MultiSelectionReviewLevel).reviewAction
        : (a as ReviewLevel).reviewInfo.reviewAction;
  const bReviewAction =
    b.reviewLevelType === ReviewLevelType.META
      ? undefined
      : b.reviewLevelType === ReviewLevelType.REVIEWABLE_MULTI
        ? (b as MultiSelectionReviewLevel).reviewAction
        : (b as ReviewLevel).reviewInfo.reviewAction;

  const reviewActionPriority = [ReviewAction.NAME_CHANGE, ReviewAction.UPDATE, undefined, ReviewAction.CREATE, ReviewAction.DELETE];
  const aIndex = reviewActionPriority.indexOf(aReviewAction);
  const bIndex = reviewActionPriority.indexOf(bReviewAction);
  if (aIndex === bIndex) {
    const aPathDepth = a.valuePath.split('/').length;
    const bPathDepth = b.valuePath.split('/').length;
    return aPathDepth - bPathDepth;
  }
  return aIndex - bIndex;
};

const buildHistoryLocation = (parentReview: BaseReviewLevel, readablePath: string) => {
  const parentHistory = parentReview.historyLocation;
  return [parentHistory, ...readablePath.split('/')].filter(part => part !== '').join(', ');
};

const isNestedUnderCreateOrDelete = (parentReview: BaseReviewLevel) => {
  if (parentReview.reviewLevelType === ReviewLevelType.META) {
    return parentReview.nestedUnderCreateOrDelete;
  }
  const parent = parentReview as ReviewLevel;
  if (isCreateReview(parent) || isDeleteReview(parent)) {
    return true;
  } else {
    return parent.nestedUnderCreateOrDelete;
  }
};

/**
 * EditorReviewMap keeps track all changes made by a specific editor.
 * This is used for accepting changes in bulk when reviewing.
 * @constructor
 */
export class EditorReviewMap {
  map: { [editor: string]: ReviewLevel[] };

  constructor() {
    this.map = {};
  }

  add(reviewLevel: ReviewLevel) {
    if (reviewLevel.nestedUnderCreateOrDelete) {
      // We only accept/reject changes at the top level (mutation/ct/therapy)
      return;
    }
    const editor = reviewLevel.reviewInfo.review.updatedBy;
    if (Object.keys(this.map).includes(editor)) {
      this.map[editor].push(reviewLevel);
    } else {
      this.map[editor] = [reviewLevel];
    }
  }

  getEditorList() {
    return Object.keys(this.map);
  }

  getReviewsByEditor(editor: string) {
    return this.map[editor];
  }
}

export const findReviews = (drugList: readonly IDrug[], gene: Gene, uuids: string[], editorReviewMap: EditorReviewMap) => {
  const rootReview: BaseReviewLevel = new BaseReviewLevel({
    reviewLevelType: ReviewLevelType.META,
    title: '',
    valuePath: '',
    historyLocation: '',
    historyInfo: {},
  });

  findReviewRecursive(gene, '', uuids, rootReview, editorReviewMap, drugList);
  return rootReview;
};

export const isIgnoredKey = (key: string) => {
  if (key.endsWith('_comments') || key.endsWith('_review')) {
    return true;
  }
  if (
    key.startsWith('name') ||
    key.startsWith('cancerTypes') ||
    key.startsWith('excludedCancerTypes') ||
    key.startsWith('excludedRCTs') ||
    key.startsWith('treatments')
  ) {
    return true;
  }
  return false;
};

export const findReviewRecursive = (
  currObj: any,
  currValuePath: string,
  uuids: string[],
  parentReview: BaseReviewLevel,
  editorReviewMap: EditorReviewMap,
  drugList: readonly IDrug[],
) => {
  if (uuids.length === 0) return;
  if (typeof currObj === 'object') {
    for (const [key, value] of Object.entries(currObj)) {
      if (isIgnoredKey(key)) continue;

      if (key === 'genomic_indicators') {
        const genomicIndicators = value as GenomicIndicator[];
        genomicIndicators.forEach((gi, index) => {
          const giPath = joinPathParts(currValuePath, 'genomic_indicators', index.toString());
          const nameReview = buildNameReview(gi, giPath, parentReview, uuids, editorReviewMap);
          parentReview.addChild(nameReview);
          findReviewRecursive(gi, giPath, uuids, nameReview, editorReviewMap, drugList);
        });
        removeLeafNodes(parentReview);
        continue;
      }

      if (key === 'mutations') {
        const mutations = value as Mutation[];
        mutations.forEach((mutation, index) => {
          const mutationPath = joinPathParts(currValuePath, 'mutations', index.toString());
          const nameReview = buildNameReview(mutation, mutationPath, parentReview, uuids, editorReviewMap);
          parentReview.addChild(nameReview);
          findReviewRecursive(mutation, mutationPath, uuids, nameReview, editorReviewMap, drugList);
        });
        removeLeafNodes(parentReview);
        continue;
      }

      if (key === 'tumors') {
        const tumors = value as Tumor[];
        tumors.forEach((tumor, index) => {
          const tumorPath = joinPathParts(currValuePath, 'tumors', index.toString());
          const cancerTypeNameReview = buildCancerTypeNameReview(tumor, tumorPath, parentReview, uuids, editorReviewMap);
          parentReview.addChild(cancerTypeNameReview);
          findReviewRecursive(tumor, tumorPath, uuids, cancerTypeNameReview, editorReviewMap, drugList);
        });
        removeLeafNodes(parentReview);
        continue;
      }

      if (key === 'TIs') {
        const TIs = value as TI[];
        for (const [tiIndex, ti] of TIs.entries()) {
          if (!ti.treatments) continue;
          for (const [treatmentIndex, treatment] of ti.treatments.entries()) {
            const treatmentPath = joinPathParts(currValuePath, 'TIs', tiIndex.toString(), 'treatments', treatmentIndex.toString());
            const treatmentNameReview = buildNameReview(treatment, treatmentPath, parentReview, uuids, editorReviewMap, drugList);
            parentReview.addChild(treatmentNameReview);
            const rctReview = buildRCTReview(treatment, treatmentNameReview, uuids, editorReviewMap);
            if (rctReview) {
              treatmentNameReview.addChild(rctReview);
            }
            findReviewRecursive(treatment, treatmentPath, uuids, treatmentNameReview, editorReviewMap, drugList);
          }
          removeLeafNodes(parentReview);
        }
        continue;
      }

      if (typeof value === 'object' && !key.includes('_uuid')) {
        const newPath = joinPathParts(currValuePath, key);
        let metaReview = buildObjectReview(value, key, parentReview, uuids, editorReviewMap);
        findReviewRecursive(value, newPath, uuids, metaReview, editorReviewMap, drugList);
        if (key === 'type' || key === 'allele_state') {
          // Checkbox reviewables should be converted to MultiSelectionReviewLevel so that they are grouped under one collapsible
          metaReview = convertToMultiSelectionReview(metaReview);
        }
        parentReview.addChild(metaReview);
        removeLeafNodes(parentReview);
        continue;
      }

      if (key.endsWith('_uuid') && uuids.includes(value as string)) {
        const relevantKeys = getRelevantKeysFromUuidKey(key);

        if (typeof currObj[relevantKeys.fieldKey] === 'string' || relevantKeys.fieldKey === 'associationVariants') {
          const stringReviewLevel = buildStringReview(currObj, currValuePath, relevantKeys, parentReview, uuids, editorReviewMap);
          parentReview.addChild(stringReviewLevel);
        }
      }
    }
  }
};

export const convertToMultiSelectionReview = (parentMetaReview: MetaReviewLevel) => {
  if (!parentMetaReview.hasChildren()) return parentMetaReview;
  const multiSelectionReviewLevel = new MultiSelectionReviewLevel({
    title: parentMetaReview.title,
    valuePath: parentMetaReview.valuePath,
    historyLocation: parentMetaReview.historyLocation,
    nestedUnderCreateorDelete: parentMetaReview.nestedUnderCreateOrDelete,
    historyInfo: { ...parentMetaReview.historyInfo, fields: [...(parentMetaReview.historyInfo.fields || [])] },
  });
  multiSelectionReviewLevel.children = parentMetaReview.children;
  return multiSelectionReviewLevel;
};

export const buildNameReview = (
  creatableObject: Mutation | Treatment | GenomicIndicator,
  currValuePath: string,
  parentReview: BaseReviewLevel,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  drugList?: readonly IDrug[],
) => {
  const nameKey = 'name';
  const isGenomicIndiciator = currValuePath.includes('genomic_indicators');

  let readableName = creatableObject.name;
  if (drugList) {
    readableName = getTxName(drugList, creatableObject.name);
  } else if (isGenomicIndiciator) {
    readableName = `${READABLE_FIELD.GENOMIC_INDICATORS} / ${readableName}`;
  }

  const valuePathParts = [currValuePath, nameKey];
  const valuePath = valuePathParts.join('/');
  let title = readableName;

  const historyInfo = _.cloneDeep(parentReview.historyInfo) || {};
  if (!drugList && !isGenomicIndiciator) {
    historyInfo.mutation = {
      name: getMutationName((creatableObject as Mutation).name, (creatableObject as Mutation).alterations),
      uuid: creatableObject.name_uuid,
    };
  } else if (drugList) {
    historyInfo.treatment = {
      name: readableName,
      uuid: creatableObject.name_uuid,
    };
    title = addSectionTitlePrefix(ReviewSectionTitlePrefix.THERAPY, title);
  }

  const metaReview = new MetaReviewLevel({
    title,
    valuePath: currValuePath,
    historyLocation: buildHistoryLocation(parentReview, readableName),
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
    historyInfo,
  });

  const nameReview = creatableObject.name_review;

  if (!nameReview) {
    return metaReview;
  }

  let readableOldName = nameReview.lastReviewed as string;

  let nameUpdated = false;
  let oldState;
  let newState;
  if (nameReview.added || nameReview.promotedToMutation) {
    newState = creatableObject;
  } else if (nameReview.removed || nameReview.demotedToVus) {
    oldState = creatableObject;
  } else if (nameReview.lastReviewed) {
    // Name was edited, so we save the old and new name to history
    nameUpdated = true;
    if (drugList) {
      readableOldName = getTxName(drugList, readableOldName);
    }
    oldState = nameReview.lastReviewed;
    newState = creatableObject.name;
  } else {
    return metaReview;
  }

  const nameReviewLevel = new ReviewLevel({
    title: nameUpdated ? makeFirebaseKeysReadable([nameKey])[0] : '',
    valuePath,
    historyLocation: buildHistoryLocation(parentReview, readableName),
    currentVal: readableName,
    reviewInfo: {
      reviewPath: `${valuePath}_review`,
      review: nameReview,
      lastReviewedString: readableOldName,
      uuid: creatableObject.name_uuid,
    },
    historyData: { oldState, newState },
    historyInfo,
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
  });

  _.pull(uuids, creatableObject.name_uuid);
  editorReviewMap.add(nameReviewLevel);

  metaReview.addChild(nameReviewLevel);

  if (!nameUpdated) {
    return getCompactReviewInfo(metaReview) as ReviewLevel;
  }

  return metaReview;
};

export const buildCancerTypeNameReview = (
  tumor: Tumor,
  currValuePath: string,
  parentReview: BaseReviewLevel,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
) => {
  const nameKey = 'cancerTypes';

  const valuePathParts = [currValuePath, nameKey];
  const valuePath = valuePathParts.join('/');
  const excludedCancerTypesPath = [currValuePath, 'excludedCancerTypes'].join('/');
  const title = makeFirebaseKeysReadable([nameKey])[0];

  const readableName = getCancerTypesNameWithExclusion(tumor.cancerTypes, tumor?.excludedCancerTypes || [], true);

  const historyInfo = _.cloneDeep(parentReview.historyInfo) || {};
  historyInfo.cancerType = {
    name: readableName,
    uuid: tumor.cancerTypes_uuid,
  };

  const metaReview = new MetaReviewLevel({
    title: addSectionTitlePrefix(ReviewSectionTitlePrefix.CANCER_TYPE, readableName),
    valuePath: currValuePath,
    historyLocation: buildHistoryLocation(parentReview, readableName),
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
    historyInfo,
  });

  const cancerTypesReview = tumor.cancerTypes_review;
  const excludedCTReview = tumor.excludedCancerTypes_review;

  if (!cancerTypesReview && !excludedCTReview) {
    return metaReview;
  }

  let nameUpdated = false;
  let oldState, newState;
  let oldTumorName;
  const newTumorName = readableName;

  if (cancerTypesReview?.added) {
    newState = tumor;
  } else if (cancerTypesReview?.removed) {
    oldState = tumor;
  } else if (cancerTypesReview?.lastReviewed || excludedCTReview?.lastReviewed) {
    nameUpdated = true;
    oldState = oldTumorName = getCancerTypesNameWithExclusion(
      (cancerTypesReview?.lastReviewed as CancerType[]) || [],
      (excludedCTReview?.lastReviewed as CancerType[]) || [],
      true,
    );
    newState = newTumorName;
  } else {
    return metaReview;
  }

  const tumorNameUuid = `${tumor.cancerTypes_uuid}, ${tumor.excludedCancerTypes_uuid}`;
  const nameReviewLevel = new TumorReviewLevel({
    title: nameUpdated ? title : '',
    valuePath,
    historyLocation: buildHistoryLocation(parentReview, newTumorName),
    currentVal: newTumorName,
    reviewInfo: {
      reviewPath: `${valuePath}_review`,
      review: cancerTypesReview,
      lastReviewedString: oldTumorName,
      uuid: tumorNameUuid,
    },
    historyData: {
      oldState,
      newState,
    },
    historyInfo,
    currentExcludedCancerTypes: tumor.excludedCancerTypes,
    excludedCancerTypesReviewInfo: {
      reviewPath: `${excludedCancerTypesPath}_review`,
      review: excludedCTReview,
      lastReviewedString: undefined,
      uuid: undefined,
    },
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
  });
  _.pull(uuids, tumor.cancerTypes_uuid);
  _.pull(uuids, tumor.excludedCancerTypes_uuid);
  editorReviewMap.add(nameReviewLevel);

  metaReview.addChild(nameReviewLevel);

  if (!nameUpdated) {
    return getCompactReviewInfo(metaReview) as ReviewLevel;
  }

  return metaReview;
};

export const buildStringReview = (
  obj: Record<string, any>,
  currValuePath: string,
  relevantKeys: RelevantKeys,
  parentReview: BaseReviewLevel,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
) => {
  const { fieldKey, reviewKey, uuidKey } = relevantKeys;

  let lastReviewedString: string;
  let currentString: string;
  if (fieldKey === 'associationVariants') {
    lastReviewedString = (((obj[reviewKey] as Review).lastReviewed as any[]) || []).map(variant => variant.name).join(', ');
    currentString = obj[fieldKey].map(variant => variant.name).join(', ');
  } else {
    lastReviewedString = (obj[reviewKey] as Review).lastReviewed as string;
    currentString = obj[fieldKey] as string;
  }

  const readableKey = makeFirebaseKeysReadable([fieldKey])[0];

  const historyInfo = _.cloneDeep(parentReview.historyInfo) || {};
  historyInfo.fields = [...(parentReview.historyInfo.fields || []), readableKey as READABLE_FIELD];

  const stringReviewLevel = new ReviewLevel({
    title: readableKey,
    valuePath: joinPathParts(currValuePath, fieldKey),
    currentVal: obj[fieldKey],
    historyLocation: buildHistoryLocation(parentReview, readableKey),
    reviewInfo: {
      reviewPath: joinPathParts(currValuePath, reviewKey),
      review: obj[reviewKey],
      lastReviewedString,
      uuid: obj[uuidKey],
    },
    historyData: {
      oldState: lastReviewedString,
      newState: currentString,
    },
    historyInfo,
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
  });

  _.pull(uuids, obj[uuidKey]);
  editorReviewMap.add(stringReviewLevel);

  return stringReviewLevel;
};

export const buildObjectReview = (
  obj: Record<string, any>,
  key: string,
  parentReview: BaseReviewLevel,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
) => {
  const readableKey = makeFirebaseKeysReadable([key])[0];

  const historyInfo = _.cloneDeep(parentReview.historyInfo) || {};
  historyInfo.fields = [...(parentReview.historyInfo.fields || []), readableKey as READABLE_FIELD];

  const metaReview = new MetaReviewLevel({
    title: readableKey,
    valuePath: joinPathParts(parentReview.valuePath, key),
    historyLocation: buildHistoryLocation(parentReview, readableKey),
    nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
    historyInfo,
  });
  if (key === 'prognostic' || key === 'diagnostic') {
    const rctReview = buildRCTReview(obj as Implication, metaReview, uuids, editorReviewMap);
    if (rctReview) {
      metaReview.addChild(rctReview);
    }
  }

  return metaReview;
};

export const buildRCTReview = (
  implication: Implication | Treatment,
  parentReview: BaseReviewLevel,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
) => {
  if (!implication.excludedRCTs && !implication.excludedRCTs_review) return;

  const nameKey = 'excludedRCTs';

  const valuePathParts = [parentReview.valuePath, nameKey];
  const valuePath = valuePathParts.join('/');
  const title = makeFirebaseKeysReadable([nameKey])[0];

  const isInitialUpdate = implication.excludedRCTs_review?.initialUpdate || false;
  const hasLastReviewed = !!implication.excludedRCTs_review?.lastReviewed;

  const newRCTString = implication.excludedRCTs ? getCancerTypesName(implication.excludedRCTs, true, '\t') : '';
  let oldRCTString = '';
  if (hasLastReviewed) {
    oldRCTString = getCancerTypesName(implication.excludedRCTs_review.lastReviewed as CancerType[], true, '\t');
  }

  if (isInitialUpdate || hasLastReviewed) {
    const rctReview = new ReviewLevel({
      title,
      valuePath,
      historyLocation: buildHistoryLocation(parentReview, title),
      currentVal: newRCTString,
      reviewInfo: {
        reviewPath: `${valuePath}_review`,
        review: implication.excludedRCTs_review,
        lastReviewedString: oldRCTString,
        uuid: implication.excludedRCTs_uuid,
      },
      historyData: {
        oldState: oldRCTString,
        newState: newRCTString,
      },
      nestedUnderCreateorDelete: isNestedUnderCreateOrDelete(parentReview),
      historyInfo: { ...parentReview.historyInfo, fields: [...(parentReview.historyInfo.fields || []), title as READABLE_FIELD] },
    });
    _.pull(uuids, implication.excludedRCTs_uuid);
    editorReviewMap.add(rctReview);
    return rctReview;
  }
};

export const clearAllNestedReviews = (obj: any) => {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      clearAllNestedReviews(item);
    }
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.endsWith('_review')) {
        clearReview(obj[key] as Review);
        continue;
      }
      clearAllNestedReviews(obj[key]);
    }
  }
  return;
};

export const clearReview = (review: Review) => {
  delete review.lastReviewed;
  delete review.added;
  delete review.removed;
  delete review.demotedToVus;
  delete review.promotedToMutation;
  delete review.initialUpdate;
  return review;
};

export const getAllNestedReviewUuids = (baseReviewLevel: BaseReviewLevel, uuids: string[]) => {
  if (baseReviewLevel.reviewLevelType === ReviewLevelType.REVIEWABLE) {
    const reviewLevel = baseReviewLevel as ReviewLevel;
    uuids.push(reviewLevel.reviewInfo.uuid);
  }
  for (const childReview of Object.values(baseReviewLevel.children)) {
    getAllNestedReviewUuids(childReview, uuids);
  }
};

export const getUpdatedReview = (
  oldReview: Review,
  currentValue: any,
  newValue: any,
  editorName: string,
  updateMetaData: boolean = true,
) => {
  if (updateMetaData) {
    if (!oldReview) {
      oldReview = new Review(editorName);
    }
    oldReview.updateTime = new Date().getTime();
    oldReview.updatedBy = editorName;
  }

  // Update Review when value is reverted to original
  let isChangeReverted = false;
  if (!('lastReviewed' in oldReview)) {
    oldReview.lastReviewed = currentValue;
    if (oldReview.lastReviewed === undefined) {
      oldReview = clearReview(oldReview);
    }
    if (oldReview?.initialUpdate) {
      if (Array.isArray(newValue) && newValue.length === 0) {
        isChangeReverted = true;
      }
    }
  } else if (_.isEqual(oldReview.lastReviewed, newValue)) {
    isChangeReverted = true;
  }

  if (isChangeReverted && !oldReview.added) {
    oldReview = clearReview(oldReview);
  }

  return { updatedReview: oldReview, isChangeReverted };
};

export const hasReview = (review: Review) => {
  if (review.lastReviewed === '' || !_.isEmpty(review.lastReviewed)) {
    return true;
  }
  const reviewableKeys: (keyof Review)[] = ['added', 'promotedToMutation', 'removed', 'demotedToVus', 'initialUpdate'];
  for (const key of reviewableKeys) {
    if (review[key] === true) {
      return true;
    }
  }
  return false;
};

export const getGenePathFromValuePath = (hugoSymbol: string, valuePath: string, isGermline = false) => {
  const _hugoSymbol = hugoSymbol.replace(/^\//, '');
  const _valuePath = valuePath.replace(/^\//, '');
  const collection = isGermline ? FB_COLLECTION.GERMLINE_GENES : FB_COLLECTION.GENES;
  if (!_hugoSymbol) {
    return collection;
  }
  if (!_valuePath) {
    return `${collection}/${_hugoSymbol}`;
  }
  return `${collection}/${_hugoSymbol}/${_valuePath}`;
};

export const showAsFirebaseTextArea = (hugoSymbol: string, valuePath: string, isGermline = false) => {
  const genePath = getGenePathFromValuePath(hugoSymbol, valuePath, isGermline);
  return (
    genePath.endsWith('/description') ||
    genePath.endsWith('/background') ||
    genePath.endsWith('/summary') ||
    genePath.endsWith('/diagnosticSummary') ||
    genePath.endsWith('/prognosticSummary')
  );
};
