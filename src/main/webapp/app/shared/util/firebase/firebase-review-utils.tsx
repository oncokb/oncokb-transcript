import {
  CancerType,
  DrugCollection,
  Gene,
  GeneType,
  GenomicIndicator,
  HistoryRecordState,
  Implication,
  Mutation,
  MutationEffect,
  Review,
  Treatment,
  Tumor,
} from 'app/shared/model/firebase/firebase.model';
import _ from 'lodash';
import { findIndexOfFirstCapital, getCancerTypeName, getCancerTypesName, getCancerTypesNameWithExclusion } from '../utils';
import { getTxName } from './firebase-utils';
import { HISTORY_LOCATION_STRINGS, TI_TYPE_TO_HISTORY_STRING } from 'app/config/constants/firebase';
import { IDrug } from 'app/shared/model/drug.model';
import { DiffMethod } from 'react-diff-viewer-continued';
import React from 'react';

const REVIEW_TITLE_PATH_SEP = ' / ';
const FIREBASE_PATH_SEP = '/';

export enum ReviewLevelType {
  META, // This means that the review level is used for grouping purposes
  REVIEWABLE, // This means that the review level has reviewable content
}

export enum ReviewAction {
  CREATE,
  DELETE,
  UPDATE,
  NAME_CHANGE,
}

export interface ReviewChildren {
  [key: string]: BaseReviewLevel;
}

export class BaseReviewLevel {
  isRoot = false;
  reviewLevelType: ReviewLevelType;
  title: string; // The title of the Collapsible
  currentValPath: string; // ie) mutations/0/mutation_effect/effect
  children: ReviewChildren;
  isUnderCreationOrDeletion: boolean;
  historyLocationString = '';

  constructor(title = '', currentValPath = '', isUnderCreationOrDeletion = false, historyLocationString = '') {
    this.title = title;
    this.currentValPath = currentValPath;
    this.isUnderCreationOrDeletion = isUnderCreationOrDeletion;
    this.children = {};
    this.historyLocationString = historyLocationString;
  }

  hasChildren() {
    return !_.isEmpty(this.children);
  }

  childrenCount() {
    return Object.keys(this.children).length;
  }

  addChild(childReview: BaseReviewLevel) {
    this.children[childReview.title] = childReview;
  }
}

export class MetaReviewLevel extends BaseReviewLevel {
  constructor(title: string, currentValPath: string) {
    super(title, currentValPath);
    this.reviewLevelType = ReviewLevelType.META;
  }
}

export class ReviewLevel extends BaseReviewLevel {
  currentVal: any;
  reviewPath: string;
  review: Review;
  lastReviewedString: string;
  reviewAction: ReviewAction;
  uuid: string;
  newState?: HistoryRecordState;
  oldState?: HistoryRecordState;
  deleteIndex?: number;
  diffMethod?: DiffMethod = DiffMethod.CHARS;
  lastReviewedString?: string;

  constructor(
    title: string,
    currentValPath: string,
    currentVal: any,
    reviewPath: string,
    review: Review,
    lastReviewedString: string,
    uuid: string,
    newState: HistoryRecordState,
    oldState: HistoryRecordState,
    isUnderCreationOrDeletion = false,
    lastReviewedString?: string
  ) {
    super(title, currentValPath, isUnderCreationOrDeletion);
    this.currentVal = currentVal;
    this.reviewPath = reviewPath;
    this.review = review;
    this.lastReviewedString = lastReviewedString;
    this.uuid = uuid;
    this.reviewLevelType = ReviewLevelType.REVIEWABLE;
    this.reviewAction = getReviewAction(review, reviewPath);
    if (newState !== undefined) {
      this.newState = newState;
    }
    if (oldState !== undefined) {
      this.oldState = oldState;
    }
    this.lastReviewedString = lastReviewedString;
  }
}

export const getReviewAction = (review: Review, reviewPath: string): ReviewAction => {
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

const getConcatPath = (parentPath: string, currentPath: string) => {
  return parentPath + FIREBASE_PATH_SEP + currentPath;
};

const isNestedUnderCreateOrDelete = (parentReview: BaseReviewLevel) => {
  if (parentReview.reviewLevelType === ReviewLevelType.META) {
    return parentReview.isUnderCreationOrDeletion;
  }
  const parent = parentReview as ReviewLevel;
  if ([ReviewAction.CREATE, ReviewAction.DELETE].includes(parent.reviewAction)) {
    return true;
  } else {
    return parent.isUnderCreationOrDeletion;
  }
};

const removeLeafNodes = (parentReview: BaseReviewLevel) => {
  for (const key of Object.keys(parentReview.children)) {
    const childReview = parentReview.children[key];
    if (!childReview.hasChildren()) {
      if (childReview.reviewLevelType === ReviewLevelType.META && !(childReview as ReviewLevel).review) {
        delete parentReview.children[key];
      }
    }
  }
};

export const getCompactReviewInfo = (review: BaseReviewLevel) => {
  if (!review.hasChildren()) {
    return review;
  }
  const numOfChildren = review.childrenCount();
  if (numOfChildren > 1) {
    return review;
  }
  let childReview = Object.values(review.children)[0];
  if (childReview.isUnderCreationOrDeletion) {
    return review;
  }
  childReview = getCompactReviewInfo(childReview);
  childReview.title = review.title + '/' + childReview.title;
  childReview.isUnderCreationOrDeletion = review.isUnderCreationOrDeletion;
  return childReview;
};

export const reformatReviewTitle = (baseReviewLevel: BaseReviewLevel) => {
  const reviewTitle = baseReviewLevel.title;
  const titleParts = reviewTitle.split('/');
  for (const [index, titlePart] of titleParts.entries()) {
    let subParts = [titlePart];
    // Seperate kebab cased
    if (titlePart.includes('_')) {
      subParts = titlePart.split('_');
    }
    // Seperate camel case
    const firstCapitalIndex = findIndexOfFirstCapital(titlePart);
    if (firstCapitalIndex > -1) {
      subParts = [titlePart.substring(0, firstCapitalIndex), titlePart.substring(firstCapitalIndex)];
    }
    titleParts[index] = subParts
      .map(subPart => {
        if (findIndexOfFirstCapital(subPart) === 0) {
          return subPart;
        } else {
          return _.capitalize(subPart);
        }
      })
      .join(' ');
  }
  const isNonActionableLevel = baseReviewLevel.reviewLevelType === ReviewLevelType.META || baseReviewLevel.isUnderCreationOrDeletion;
  if (isNonActionableLevel) {
    return <span className="font-weight-normal">{titleParts.join(' / ')}</span>;
  }
  const lastTitlePart = titleParts.pop();
  return (
    <>
      <span className="font-weight-normal">{titleParts.join(' / ')}</span>
      {titleParts.length > 0 && <span className="font-weight-normal"> / </span>}
      <span className="font-weight-bold">{lastTitlePart}</span>
    </>
  );
};

export const reviewLevelSortMethod = (a: ReviewLevel, b: ReviewLevel) => {
  const reviewActionPriority = [ReviewAction.NAME_CHANGE, ReviewAction.UPDATE, ReviewAction.CREATE, ReviewAction.DELETE];
  const aIndex = reviewActionPriority.indexOf(a.reviewAction);
  const bIndex = reviewActionPriority.indexOf(b.reviewAction);
  if (aIndex === -1) {
    return 1;
  }
  if (bIndex === 1) {
    return -1;
  }
  return aIndex - bIndex;
};

const getHistoryLocationString = (parentReview: BaseReviewLevel, currLocation = '') => {
  if (parentReview.historyLocationString !== '') {
    if (currLocation === '') {
      return parentReview.historyLocationString;
    }
    return [parentReview.historyLocationString, currLocation].join(', ');
  }
  return currLocation;
};

/*
 * Utility methods to construct the review collapsible structure
 */

export class EditorReviewMap {
  map: { [editor: string]: ReviewLevel[] };

  constructor() {
    this.map = {};
  }

  add(editor: string, reviewLevel: ReviewLevel) {
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

const getEditorFromReview = (review: Review): string => {
  return review.updatedBy;
};

const findGeneTypeReviews = (geneType: GeneType, uuids: string[], editorReviewMap: EditorReviewMap, parentReview: BaseReviewLevel) => {
  const titleParts = ['Gene Type'];
  const firebaseKeyPath = 'type';
  for (const [geneTypeKey, geneTypeValue] of Object.entries(geneType)) {
    if (geneTypeKey.endsWith('_uuid') && uuids.includes(geneTypeValue)) {
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(geneTypeKey);
      if (geneTypeKey.startsWith('ocg')) {
        titleParts.push('Oncogene');
      }
      if (geneTypeKey.startsWith('tsg')) {
        titleParts.push('Tumor Suppressor');
      }
      const title = titleParts.join(REVIEW_TITLE_PATH_SEP);

      const geneTypeReview = new ReviewLevel(
        title,
        getConcatPath(firebaseKeyPath, fieldKey),
        geneType[fieldKey],
        getConcatPath(firebaseKeyPath, reviewKey),
        geneType[reviewKey],
        geneType[reviewKey].lastReviewed as string,
        geneTypeValue,
        geneType[fieldKey],
        geneType[reviewKey].lastReviewed
      );
      geneTypeReview.diffMethod = DiffMethod.WORDS;
      geneTypeReview.historyLocationString = getHistoryLocationString(parentReview, HISTORY_LOCATION_STRINGS.GENE_TYPE);
      editorReviewMap.add(getEditorFromReview(geneType[reviewKey] as Review), geneTypeReview);
      parentReview.addChild(geneTypeReview);
    }
  }
};

export const findGeneLevelReviews = (drugList: readonly IDrug[], gene: Gene, uuids: string[], editorReviewMap: EditorReviewMap) => {
  const rootReview: BaseReviewLevel = new BaseReviewLevel();
  rootReview.isRoot = true;

  const skipGeneKeys: (keyof Gene)[] = ['mutations', 'type_uuid'];
  // Find reviews for gene fields
  for (const [geneKey, geneValue] of Object.entries(gene)) {
    if (skipGeneKeys.includes(geneKey as keyof Gene)) continue;
    if (geneKey.endsWith('_uuid') && uuids.includes(geneValue as string)) {
      uuids = uuids.filter(uuid => uuid !== geneKey);
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(geneKey);
      const geneFieldReview = new ReviewLevel(
        fieldKey,
        fieldKey,
        gene[fieldKey],
        reviewKey,
        gene[reviewKey],
        gene[reviewKey].lastReviewed as string,
        geneValue,
        gene[fieldKey],
        gene[reviewKey].lastReviewed
      );
      if ((geneKey as keyof Gene) === 'summary_uuid') {
        geneFieldReview.historyLocationString = getHistoryLocationString(rootReview, HISTORY_LOCATION_STRINGS.GENE_SUMMARY);
      }
      if ((geneKey as keyof Gene) === 'background_uuid') {
        geneFieldReview.historyLocationString = getHistoryLocationString(rootReview, HISTORY_LOCATION_STRINGS.GENE_BACKGROUND);
      }
      if ((geneKey as keyof Gene) === 'penetrance_uuid') {
        geneFieldReview.historyLocationString = getHistoryLocationString(rootReview, HISTORY_LOCATION_STRINGS.PENETRANCE);
      }
      if ((geneKey as keyof Gene) === 'inheritanceMechanism_uuid') {
        geneFieldReview.historyLocationString = getHistoryLocationString(rootReview, HISTORY_LOCATION_STRINGS.INHERITANCE_MECHANISM);
      }
      rootReview.addChild(geneFieldReview);
      editorReviewMap.add(getEditorFromReview(gene[reviewKey]), geneFieldReview);
    }
  }

  // Custom logic for gene type fields
  findGeneTypeReviews(gene.type, uuids, editorReviewMap, rootReview);

  if (gene.genomic_indicators) {
    findGenomicIndicatorsReviews(gene.genomic_indicators, uuids, editorReviewMap, rootReview);
  }

  // Find reviews for mutations field
  if (gene.mutations) {
    findMutationLevelReviews(drugList, gene.mutations, uuids, editorReviewMap, rootReview);
  }
  return rootReview;
};

const findMutationEffectReviews = (
  mutationEffect: MutationEffect,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  const firebaseKeyPath = 'mutation_effect';
  for (const [meKey, meValue] of Object.entries(mutationEffect)) {
    if (meKey.endsWith('_uuid') && uuids.includes(meValue)) {
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(meKey);
      const title = `Mutation Effect/${fieldKey}`;
      const currentValPath = `${parentReview.currentValPath}/${firebaseKeyPath}/${fieldKey}`;
      const reviewPath = `${parentReview.currentValPath}/${firebaseKeyPath}/${reviewKey}`;
      const meReview: ReviewLevel = new ReviewLevel(
        title,
        currentValPath,
        mutationEffect[fieldKey],
        reviewPath,
        mutationEffect[reviewKey],
        mutationEffect[reviewKey].lastReviewed as string,
        meValue,
        { [fieldKey]: mutationEffect[fieldKey] },
        { [fieldKey]: mutationEffect[reviewKey].lastReviewed },
        isNestedUnderCreateOrDelete(parentReview)
      );
      if (fieldKey === 'oncogenic' || fieldKey === 'effect') {
        meReview.diffMethod = DiffMethod.WORDS;
      }
      meReview.historyLocationString = getHistoryLocationString(parentReview, HISTORY_LOCATION_STRINGS.MUTATION_EFFECT);
      parentReview.addChild(meReview);
      editorReviewMap.add(getEditorFromReview(mutationEffect[reviewKey]), meReview);
    }
  }
};

const findGenomicIndicatorsReviews = (
  genomicIndicators: GenomicIndicator[],
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  for (const [index, genomicIndicator] of genomicIndicators.entries()) {
    const indicatorTitle = genomicIndicator.name;
    const indicatorPath = `genomic_indicators/${index}`;

    let defaultReview: ReviewLevel | MetaReviewLevel;
    if (genomicIndicator.name_review?.added || genomicIndicator.name_review?.removed) {
      defaultReview = new ReviewLevel(
        indicatorTitle,
        `${indicatorPath}/name`,
        genomicIndicator.name_review.lastReviewed || '',
        `${indicatorPath}/name_review`,
        genomicIndicator.name_review,
        genomicIndicator.name_uuid,
        genomicIndicator.name_review.added ? genomicIndicator : undefined,
        genomicIndicator.name_review.removed ? genomicIndicator : undefined
      );
      editorReviewMap.add(getEditorFromReview(genomicIndicator.name_review), defaultReview as ReviewLevel);
      parentReview.addChild(defaultReview);
    } else {
      defaultReview = new MetaReviewLevel(indicatorTitle, indicatorPath);
    }
    defaultReview.historyLocationString = getHistoryLocationString(parentReview, `Genomic Indicators, ${genomicIndicator.name}`);
    parentReview.addChild(defaultReview);

    const skipKeys: (keyof GenomicIndicator)[] = ['name_uuid'];
    for (const [key, value] of Object.entries(genomicIndicator)) {
      if (skipKeys.includes(key as keyof GenomicIndicator)) continue;
      if (key.endsWith('_uuid') && uuids.includes(value as string)) {
        const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(key);

        let lastReviewedString: string;
        if (fieldKey === 'associationVariants') {
          lastReviewedString = genomicIndicator[reviewKey].lastReviewed?.map(variant => variant.name).join(', ');
        } else {
          lastReviewedString = genomicIndicator[reviewKey].lastReviewed;
        }

        let currentVal;
        if (fieldKey === 'associationVariants') {
          currentVal = genomicIndicator[fieldKey]?.map(variant => variant.name).join(', ');
        } else {
          currentVal = genomicIndicator[fieldKey];
        }

        const indicatorReview = new ReviewLevel(
          fieldKey,
          `${indicatorPath}/${fieldKey}`,
          currentVal,
          `${indicatorPath}/${reviewKey}`,
          genomicIndicator[reviewKey],
          value,
          { [fieldKey]: genomicIndicator[fieldKey] },
          { [fieldKey]: genomicIndicator[reviewKey].lastReviewed },
          isNestedUnderCreateOrDelete(defaultReview),
          lastReviewedString
        );

        let location: string;
        if (fieldKey === 'associationVariants') {
          location = 'Association Variants';
        } else {
          location = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
        }

        indicatorReview.historyLocationString = getHistoryLocationString(defaultReview, location);
        defaultReview.addChild(indicatorReview);
        editorReviewMap.add(getEditorFromReview(genomicIndicator[reviewKey]), indicatorReview);
      }
    }
  }
};

const findMutationLevelReviews = (
  drugList: readonly IDrug[],
  mutations: Mutation[],
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  for (const [mutationIndex, mutation] of mutations.entries()) {
    const mutationTitle = mutation.name;
    const mutationPath = `mutations/${mutationIndex}`;

    let defaultReview: ReviewLevel | MetaReviewLevel;
    if (mutation.name_review?.added || mutation.name_review?.removed) {
      defaultReview = new ReviewLevel(
        mutationTitle,
        `${mutationPath}/name`,
        mutation.name_review,
        `${mutationPath}/name_review`,
        mutation.name_review,
        mutation.name_review?.lastReviewed as string,
        mutation.name_uuid,
        mutation.name_review.added ? mutation : undefined,
        mutation.name_review.removed ? mutation : undefined
      );
      editorReviewMap.add(getEditorFromReview(mutation.name_review), defaultReview as ReviewLevel);
    } else if (mutation.name_review?.lastReviewed) {
      defaultReview = new MetaReviewLevel(mutationTitle, mutationPath);
      const mutationNameReview = new ReviewLevel(
        'Name',
        `${mutationPath}/name`,
        mutation.name,
        `${mutationPath}/name_review`,
        mutation.name_review,
        mutation.name_review?.lastReviewed as string,
        mutation.name_uuid,
        mutation.name,
        mutation.name_review.lastReviewed as string
      );
      defaultReview.addChild(mutationNameReview);
      editorReviewMap.add(getEditorFromReview(mutation.name_review), defaultReview as ReviewLevel);
    } else {
      defaultReview = new MetaReviewLevel(mutationTitle, mutationPath);
    }
    defaultReview.historyLocationString = getHistoryLocationString(parentReview, mutationTitle);
    parentReview.addChild(defaultReview);

    const parentMutationReview = parentReview.children[mutationTitle];

    // Handle mutation fields
    const skipMutationKeys: (keyof Mutation)[] = ['tumors', 'name_uuid', 'mutation_effect_uuid'];
    for (const [mutationKey, mutationValue] of Object.entries(mutation)) {
      if (skipMutationKeys.includes(mutationKey as keyof Mutation)) continue;
      if (mutationKey.endsWith('_uuid') && uuids.includes(mutationValue as string)) {
        const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(mutationKey);
        const mutationReview = new ReviewLevel(
          fieldKey,
          `${mutationPath}/${fieldKey}`,
          mutation[fieldKey],
          `${mutationPath}/${reviewKey}`,
          mutation[reviewKey],
          mutation[reviewKey].lastReviewed as string,
          mutationValue,
          { [fieldKey]: mutation[fieldKey] },
          { [fieldKey]: mutation[reviewKey].lastReviewed },
          isNestedUnderCreateOrDelete(parentMutationReview)
        );
        mutationReview.historyLocationString = getHistoryLocationString(parentMutationReview, '');
        parentMutationReview.addChild(mutationReview);
        editorReviewMap.add(getEditorFromReview(mutation[reviewKey]), mutationReview);
      }
    }

    // Handle mutation effect fields
    findMutationEffectReviews(mutation.mutation_effect, uuids, editorReviewMap, parentMutationReview);

    if (mutation.penetrance) {
      findObjectReviews(
        mutation.penetrance,
        'Mutation Specific Penetrance',
        'penetrance',
        HISTORY_LOCATION_STRINGS.MUTATION_SPECIFIC_PENETRANCE,
        uuids,
        editorReviewMap,
        parentMutationReview
      );
    }
    if (mutation.inheritance_mechanism) {
      findObjectReviews(
        mutation.inheritance_mechanism,
        'Mutation Specific Inheritance Mechanism',
        'inheritance_mechanism',
        HISTORY_LOCATION_STRINGS.MUTATION_SPECIFIC_INHERITANCE_MECHANISM,
        uuids,
        editorReviewMap,
        parentMutationReview
      );
    }
    if (mutation.cancer_risk) {
      findObjectReviews(
        mutation.cancer_risk,
        'Mutation Specific Cancer Risk',
        'cancer_risk',
        HISTORY_LOCATION_STRINGS.MUTATION_SPECIFIC_CANCER_RISK,
        uuids,
        editorReviewMap,
        parentMutationReview
      );
    }

    // Handle tumors
    if (mutation.tumors) {
      findTumorLevelReviews(drugList, mutation.tumors, uuids, editorReviewMap, parentMutationReview);
    }
  }

  // Remove all mutation reviews that don't have any reviewables
  removeLeafNodes(parentReview);
};

const findObjectReviews = (
  object: Record<string, any>,
  objectName: string,
  objectKey: string,
  historyLocationString: HISTORY_LOCATION_STRINGS,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  for (const [key, value] of Object.entries(object)) {
    if (key.endsWith('_uuid') && uuids.includes(value)) {
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(key);
      const title = `${objectName}/${fieldKey}`;
      const currentValPath = `${parentReview.currentValPath}/${objectKey}/${fieldKey}`;
      const reviewPath = `${parentReview.currentValPath}/${objectKey}/${reviewKey}`;
      const meReview: ReviewLevel = new ReviewLevel(
        title,
        currentValPath,
        object[fieldKey],
        reviewPath,
        object[reviewKey],
        value,
        { [fieldKey]: object[fieldKey] },
        { [fieldKey]: object[reviewKey].lastReviewed },
        isNestedUnderCreateOrDelete(parentReview)
      );
      if (fieldKey === 'oncogenic' || fieldKey === 'effect') {
        meReview.diffMethod = DiffMethod.WORDS;
      }
      meReview.historyLocationString = getHistoryLocationString(parentReview, historyLocationString);
      parentReview.addChild(meReview);
      editorReviewMap.add(getEditorFromReview(object[reviewKey]), meReview);
    }
  }
};

const findDiagnosticLevelReviews = (
  diagnostic: Implication,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  const diagnosticPath = `${parentReview.currentValPath}/diagnostic`;
  const skipDiagnosticKeys: (keyof Implication)[] = ['excludedRCTs_uuid'];
  for (const [dKey, dValue] of Object.entries(diagnostic)) {
    if (skipDiagnosticKeys.includes(dKey as keyof Implication)) continue;
    if (dKey.endsWith('_uuid') && uuids.includes(dValue)) {
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(dKey);
      const title = `Diagnostic Implication/${fieldKey}`;
      const currentValPath = `${diagnosticPath}/${fieldKey}`;
      const reviewPath = `${diagnosticPath}/${reviewKey}`;
      const diagnosticReview: ReviewLevel = new ReviewLevel(
        title,
        currentValPath,
        diagnostic[fieldKey],
        reviewPath,
        diagnostic[reviewKey],
        diagnostic[reviewKey].lastReviewed as string,
        dValue,
        { [fieldKey]: diagnostic[fieldKey] },
        { [fieldKey]: diagnostic[reviewKey].lastReviewed },
        isNestedUnderCreateOrDelete(parentReview)
      );
      diagnosticReview.historyLocationString = getHistoryLocationString(parentReview, HISTORY_LOCATION_STRINGS.DIAGNOSTIC);
      parentReview.addChild(diagnosticReview);
      editorReviewMap.add(getEditorFromReview(diagnostic[reviewKey]), diagnosticReview);
    }
  }

  if (diagnostic.excludedRCTs) {
    getRelevantCancerTypesReview(`${diagnosticPath}/excludedRCTs`, diagnostic, uuids, editorReviewMap, parentReview);
  }
};

const findPrognosticLevelReviews = (
  prognostic: Implication,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  const prognosticPath = `${parentReview.currentValPath}/prognostic`;
  const skipPrognosticKeys: (keyof Implication)[] = ['excludedRCTs_uuid'];
  for (const [pKey, pValue] of Object.entries(prognostic)) {
    if (skipPrognosticKeys.includes(pKey as keyof Implication)) continue;
    if (pKey.endsWith('_uuid') && uuids.includes(pValue)) {
      const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(pKey);
      const title = `Prognostic Implication/${fieldKey}`;
      const currentValPath = `${prognosticPath}/${fieldKey}`;
      const reviewPath = `${prognosticPath}/${reviewKey}`;
      const prognosticReview: ReviewLevel = new ReviewLevel(
        title,
        currentValPath,
        prognostic[fieldKey],
        reviewPath,
        prognostic[reviewKey],
        prognostic[reviewKey].lastReviewed as string,
        pValue,
        { [fieldKey]: prognostic[fieldKey] },
        { [fieldKey]: prognostic[reviewKey].lastReviewed },
        isNestedUnderCreateOrDelete(parentReview)
      );
      prognosticReview.historyLocationString = getHistoryLocationString(parentReview, HISTORY_LOCATION_STRINGS.PROGNOSTIC);
      parentReview.addChild(prognosticReview);
      editorReviewMap.add(getEditorFromReview(prognostic[reviewKey]), prognosticReview);
    }
  }

  if (prognostic.excludedRCTs) {
    getRelevantCancerTypesReview(`${prognosticPath}/excludedRCTs`, prognostic, uuids, editorReviewMap, parentReview);
  }
};

const findTumorLevelReviews = (
  drugList: readonly IDrug[],
  tumors: Tumor[],
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  for (const [tumorIndex, tumor] of tumors.entries()) {
    const tumorTitle = getCancerTypesNameWithExclusion(tumor.cancerTypes, tumor?.excludedCancerTypes || [], true);
    const tumorPath = `${parentReview.currentValPath}/tumors/${tumorIndex}`;
    const lastReviewTumorString = getCancerTypesNameWithExclusion(
      (tumor.cancerTypes_review?.lastReviewed as CancerType[]) || [],
      (tumor.excludedCancerTypes_review?.lastReviewed as CancerType[]) || [],
      true
    );

    let defaultReview: ReviewLevel | MetaReviewLevel;
    if (tumor.cancerTypes_review?.added || tumor.cancerTypes_review?.removed) {
      defaultReview = new ReviewLevel(
        tumorTitle,
        `${tumorPath}/cancerTypes`,
        tumorTitle,
        `${tumorPath}/cancerTypes_review`,
        tumor.cancerTypes_review,
        lastReviewTumorString,
        tumor.cancerTypes_uuid,
        tumor.cancerTypes_review.added ? tumor : undefined,
        tumor.cancerTypes_review.removed ? tumor : undefined
      );
      editorReviewMap.add(getEditorFromReview(tumor.cancerTypes_review), defaultReview as ReviewLevel);
    } else if (tumor.cancerTypes_review?.lastReviewed || tumor.excludedCancerTypes_review?.lastReviewed) {
      defaultReview = new MetaReviewLevel(tumorTitle, tumorPath);
      const fieldKey = tumor.cancerTypes_review?.lastReviewed ? 'cancerTypes' : 'excludedCancerTypes';
      const tumorNameReview = new ReviewLevel(
        'Name',
        `${tumorPath}/${fieldKey}`,
        tumorTitle,
        `${tumorPath}/${fieldKey}_review`,
        tumor.cancerTypes_review,
        lastReviewTumorString,
        tumor.cancerTypes_uuid,
        tumor,
        tumor.cancerTypes_review.lastReviewed as string
      );
      defaultReview.addChild(tumorNameReview);
      editorReviewMap.add(getEditorFromReview(tumor.cancerTypes_review), defaultReview as ReviewLevel);
    } else {
      defaultReview = new MetaReviewLevel(tumorTitle, tumorPath);
    }
    defaultReview.historyLocationString = getHistoryLocationString(parentReview, tumorTitle);
    parentReview.addChild(defaultReview);

    const parentTumorReview = parentReview.children[tumorTitle];

    const skipTumorKeys: (keyof Tumor)[] = ['TIs', 'cancerTypes_uuid', 'excludedCancerTypes_uuid', 'prognostic_uuid', 'diagnostic_uuid'];
    for (const [tumorKey, tumorValue] of Object.entries(tumor)) {
      if (skipTumorKeys.includes(tumorKey as keyof Tumor)) continue;
      if (tumorKey.endsWith('_uuid') && uuids.includes(tumorValue as string)) {
        const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(tumorKey);
        const tumorReview = new ReviewLevel(
          fieldKey,
          `${tumorPath}/${fieldKey}`,
          tumor[fieldKey],
          `${tumorPath}/${reviewKey}`,
          tumor[reviewKey],
          tumor[reviewKey].lastReviewed as string,
          tumorValue,
          { [fieldKey]: tumor[fieldKey] },
          { [fieldKey]: tumor[reviewKey].lastReviewed },
          isNestedUnderCreateOrDelete(parentTumorReview)
        );
        let currentHistoryLocation = '';
        if ((tumorKey as keyof Tumor) === 'diagnosticSummary_uuid') {
          tumorReview.oldState = tumor.diagnosticSummary_review.lastReviewed as string;
          tumorReview.newState = tumor.diagnosticSummary;
          currentHistoryLocation = HISTORY_LOCATION_STRINGS.DIAGNOSTIC_SUMMARY;
        }
        if ((tumorKey as keyof Tumor) === 'prognosticSummary_uuid') {
          tumorReview.oldState = tumor.prognosticSummary_review.lastReviewed as string;
          tumorReview.newState = tumor.prognosticSummary;
          currentHistoryLocation = HISTORY_LOCATION_STRINGS.PROGNOSTIC_SUMMARY;
        }
        tumorReview.historyLocationString = getHistoryLocationString(parentTumorReview, currentHistoryLocation);
        parentTumorReview.addChild(tumorReview);
        editorReviewMap.add(getEditorFromReview(tumor[reviewKey]), tumorReview);
      }
    }

    findDiagnosticLevelReviews(tumor.diagnostic, uuids, editorReviewMap, parentTumorReview);
    findPrognosticLevelReviews(tumor.prognostic, uuids, editorReviewMap, parentTumorReview);

    // Handle treatment reviews
    findTreatmentLevelReviews(drugList, tumor, uuids, editorReviewMap, parentTumorReview);

    removeLeafNodes(parentReview);
  }
};

const findTreatmentLevelReviews = (
  drugList: readonly IDrug[],
  tumor: Tumor,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  for (const [tiIndex, ti] of tumor.TIs.entries()) {
    if (!ti.treatments) continue;
    for (const [treatmentIndex, treatment] of ti.treatments.entries()) {
      const treatmentTitle = getTxName(drugList, treatment.name);
      const treatmentPath = `${parentReview.currentValPath}/TIs/${tiIndex}/treatments/${treatmentIndex}`;
      let defaultReview: ReviewLevel | MetaReviewLevel;
      if (treatment.name_review?.added || treatment.name_review?.removed) {
        defaultReview = new ReviewLevel(
          treatmentTitle,
          `${treatmentPath}/name`,
          getTxName(drugList, treatment.name),
          `${treatmentPath}/name_review`,
          treatment.name_review,
          treatment.name_review?.lastReviewed ? getTxName(drugList, treatment.name_review?.lastReviewed as string) : undefined,
          treatment.name_uuid,
          treatment.name_review.added ? treatment : undefined,
          treatment.name_review.removed ? treatment : undefined
        );
        editorReviewMap.add(getEditorFromReview(treatment.name_review), defaultReview as ReviewLevel);
      } else if (treatment.name_review?.lastReviewed) {
        defaultReview = new MetaReviewLevel(treatmentTitle, treatmentPath);
        const treatmentNameReview = new ReviewLevel(
          'Name',
          `${treatmentPath}/name`,
          getTxName(drugList, treatment.name),
          `${treatmentPath}/name_review`,
          treatment.name_review,
          treatment.name_review?.lastReviewed ? getTxName(drugList, treatment.name_review?.lastReviewed as string) : undefined,
          treatment.name_uuid,
          treatment.name,
          treatment.name_review.lastReviewed as string
        );
        defaultReview.addChild(treatmentNameReview);
        editorReviewMap.add(getEditorFromReview(treatment.name_review), defaultReview as ReviewLevel);
      } else {
        defaultReview = new MetaReviewLevel(treatmentTitle, treatmentPath);
      }
      const treatmentHistoryString = `${TI_TYPE_TO_HISTORY_STRING[ti.type]}, ${treatment.name}`;
      defaultReview.historyLocationString = getHistoryLocationString(parentReview, treatmentHistoryString);
      parentReview.addChild(defaultReview);

      const parentTreatmentReview = parentReview.children[treatmentTitle];

      const skipTreatmentKeys: (keyof Treatment)[] = ['name_uuid', 'excludedRCTs_uuid'];
      for (const [treatmentKey, treatmentValue] of Object.entries(treatment)) {
        if (skipTreatmentKeys.includes(treatmentKey as keyof Treatment)) continue;
        if (treatmentKey.endsWith('_uuid') && uuids.includes(treatmentValue as string)) {
          const { fieldKey, reviewKey, ...rest } = getRelevantKeysFromUuidKey(treatmentKey);
          const treatmentReview = new ReviewLevel(
            fieldKey,
            `${treatmentPath}/${fieldKey}`,
            treatment[fieldKey],
            `${treatmentPath}/${reviewKey}`,
            treatment[reviewKey],
            treatment[reviewKey]?.lastReviewed as string,
            treatmentValue,
            { [fieldKey]: treatment[fieldKey] },
            { [fieldKey]: treatment[reviewKey].lastReviewed },
            isNestedUnderCreateOrDelete(parentTreatmentReview)
          );
          treatmentReview.historyLocationString = getHistoryLocationString(parentTreatmentReview, '');
          parentTreatmentReview.addChild(treatmentReview);
          editorReviewMap.add(getEditorFromReview(treatment[reviewKey]), treatmentReview);
        }
      }

      if (treatment.excludedRCTs) {
        getRelevantCancerTypesReview(`${treatmentPath}/excludedRCTs`, treatment, uuids, editorReviewMap, parentReview);
      }
    }
  }
  removeLeafNodes(parentReview);
};

const getRelevantCancerTypesReview = (
  rctPath: string,
  relevantCancerTypesInfo: Implication | Treatment,
  uuids: string[],
  editorReviewMap: EditorReviewMap,
  parentReview: BaseReviewLevel
) => {
  if (!uuids.includes(relevantCancerTypesInfo.excludedRCTs_uuid)) {
    return;
  }

  let defaultReview: ReviewLevel;

  const currentRCTString = getCancerTypesName(relevantCancerTypesInfo.excludedRCTs, true, '\t');
  const oldRCTString = relevantCancerTypesInfo?.excludedRCTs_review?.initialUpdate
    ? ''
    : getCancerTypesName(relevantCancerTypesInfo.excludedRCTs_review.lastReviewed as CancerType[], true, '\t');

  if (relevantCancerTypesInfo?.excludedRCTs_review?.initialUpdate || relevantCancerTypesInfo?.excludedRCTs_review?.lastReviewed) {
    defaultReview = new ReviewLevel(
      'Relevant Cancer Types',
      rctPath,
      currentRCTString,
      `${rctPath}_review`,
      relevantCancerTypesInfo.excludedRCTs_review,
      oldRCTString,
      relevantCancerTypesInfo.excludedRCTs_uuid,
      currentRCTString,
      oldRCTString
    );
    editorReviewMap.add(getEditorFromReview(relevantCancerTypesInfo.excludedRCTs_review), defaultReview);
  }
  defaultReview.historyLocationString = getHistoryLocationString(parentReview, HISTORY_LOCATION_STRINGS.RELEVANT_CANCER_TYPE);
  parentReview.addChild(defaultReview);
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
  return review;
};

export const getAllNestedReviewUuids = (baseReviewLevel: BaseReviewLevel, uuids: string[]) => {
  if (baseReviewLevel.reviewLevelType === ReviewLevelType.REVIEWABLE) {
    const reviewLevel = baseReviewLevel as ReviewLevel;
    uuids.push(reviewLevel.uuid);
    for (const childReview of Object.values(reviewLevel.children)) {
      getAllNestedReviewUuids(childReview, uuids);
    }
  }
};
