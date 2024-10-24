import { ReviewAction } from 'app/config/constants/firebase';
import { FirebaseHistoryService } from 'app/service/firebase/firebase-history-service';
import { FirebaseMetaService } from 'app/service/firebase/firebase-meta-service';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';
import { DrugCollection, Gene, Review } from '../../shared/model/firebase/firebase.model';
import { buildHistoryFromReviews } from '../../shared/util/firebase/firebase-history-utils';
import {
  extractArrayPath,
  FIREBASE_LIST_PATH_TYPE,
  getFirebasePathType,
  parseFirebaseGenePath,
} from '../../shared/util/firebase/firebase-path-utils';
import {
  ReviewLevel,
  TumorReviewLevel,
  clearAllNestedReviews,
  clearReview,
  getAllNestedReviewUuids,
  getUpdatedReview,
  isCreateReview,
  isDeleteReview,
  updateItemsToDeleteMap,
} from '../../shared/util/firebase/firebase-review-utils';
import { getFirebaseGenePath, getFirebaseMetaGenePath, getFirebaseVusPath } from '../../shared/util/firebase/firebase-utils';
import { generateUuid, parseAlterationName } from '../../shared/util/utils';
import { FirebaseVusService } from './firebase-vus-service';
import { SentryError } from 'app/config/sentry-error';
import { ActionType } from 'app/pages/curation/collapsible/ReviewCollapsible';

export type ItemsToDeleteMap = { [key in FIREBASE_LIST_PATH_TYPE]: { [path in string]: number[] } };
import {
  getEvidence,
  pathToDeleteEvidenceArgs,
  pathToGetEvidenceArgs,
} from 'app/shared/util/core-evidence-submission/core-evidence-submission';
import { EvidenceApi } from 'app/shared/api/manual/evidence-api';
import { createGeneTypePayload, isGeneTypeChange } from 'app/shared/util/core-gene-type-submission/core-gene-type-submission';
import { GeneTypeApi } from 'app/shared/api/manual/gene-type-api';
import { flattenReviewPaths, useLastReviewedOnly } from 'app/shared/util/core-submission-shared/core-submission-utils';
import { AppConfig } from 'app/appConfig';

export class FirebaseGeneReviewService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;
  firebaseMetaService: FirebaseMetaService;
  firebaseHistoryService: FirebaseHistoryService;
  firebaseVusService: FirebaseVusService;
  evidenceClient: EvidenceApi;
  geneTypeClient: GeneTypeApi;

  constructor(
    firebaseRepository: FirebaseRepository,
    authStore: AuthStore,
    firebaseMetaService: FirebaseMetaService,
    firebaseHistoryService: FirebaseHistoryService,
    firebaseVusService: FirebaseVusService,
    evidenceClient: EvidenceApi,
    geneTypeClient: GeneTypeApi,
  ) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
    this.firebaseMetaService = firebaseMetaService;
    this.firebaseHistoryService = firebaseHistoryService;
    this.firebaseVusService = firebaseVusService;
    this.evidenceClient = evidenceClient;
    this.geneTypeClient = geneTypeClient;
  }

  getGeneUpdateObject = (updateValue: any, updatedReview: Review, firebasePath: string, uuid: string | undefined) => {
    const updateObject = {
      [firebasePath]: updateValue,
      [`${firebasePath}_review`]: updatedReview,
      [`${firebasePath}_uuid`]: uuid ?? generateUuid(),
    };

    return updateObject;
  };

  updateReviewableContent = async (
    firebasePath: string,
    currentValue: any,
    updateValue: any,
    review: Review | null | undefined,
    uuid: string | null | undefined,
    updateMetaData: boolean = true,
    shouldSave: boolean = true,
  ) => {
    const isGermline = firebasePath.toLowerCase().includes('germline');

    const { updatedReview, isChangeReverted } = getUpdatedReview(
      review,
      currentValue,
      updateValue,
      this.authStore.fullName,
      updateMetaData,
    );

    const { hugoSymbol } = parseFirebaseGenePath(firebasePath) ?? {};

    let updateObject = this.getGeneUpdateObject(updateValue, updatedReview!, firebasePath, uuid!);
    const metaUpdateObject = this.firebaseMetaService.getUpdateObject(!isChangeReverted, hugoSymbol!, isGermline, uuid!);
    updateObject = { ...updateObject, ...metaUpdateObject };

    if (!shouldSave) {
      return updateObject;
    }

    try {
      await this.firebaseRepository.update('/', updateObject);
      return updateObject;
    } catch (error) {
      throw new SentryError('Failed to update reviewable content', updateObject);
    }
  };

  acceptChanges = async ({
    gene,
    hugoSymbol,
    reviewLevels,
    isGermline,
    isAcceptAll = false,
    drugListRef,
    entrezGeneId,
  }: {
    gene: Gene;
    hugoSymbol: string;
    reviewLevels: ReviewLevel[];
    isGermline: boolean;
    isAcceptAll?: boolean;
    drugListRef: DrugCollection;
    entrezGeneId: number;
  }): Promise<
    | {
        shouldRefresh: boolean;
      }
    | undefined
    | void
  > => {
    const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const firebaseVusPath = getFirebaseVusPath(isGermline, hugoSymbol);

    let itemsToDelete: ItemsToDeleteMap = {
      [FIREBASE_LIST_PATH_TYPE.MUTATION_LIST]: {},
      [FIREBASE_LIST_PATH_TYPE.TUMOR_LIST]: {},
      [FIREBASE_LIST_PATH_TYPE.TREATMENT_LIST]: {},
    };

    let evidences: ReturnType<typeof getEvidence> = {};
    let geneTypePayload: ReturnType<typeof createGeneTypePayload> | undefined = undefined;
    let hasEvidences = false;
    try {
      const flattenedReviewLevels = reviewLevels.flatMap(flattenReviewPaths);
      // Generate a new version of the gene object (`approvedGene`) for the getEvidence payload.
      // This ensures that if multiple valuePaths modify the same part of the payload,
      // the changes are applied consistently, preventing any section from being overwritten unintentionally.
      const approvedGene = useLastReviewedOnly(gene, ...flattenedReviewLevels.map(x => x.valuePath)) as Gene;
      for (const reviewLevel of flattenedReviewLevels) {
        if (!isCreateReview(reviewLevel)) {
          if (reviewLevel.reviewInfo.review.removed) {
            const deleteEvidencesPayload = pathToDeleteEvidenceArgs({ valuePath: reviewLevel.valuePath, gene });
            if (deleteEvidencesPayload !== undefined) {
              this.evidenceClient.deleteEvidences(deleteEvidencesPayload);
            }
          } else if (isGeneTypeChange(reviewLevel.valuePath)) {
            geneTypePayload = createGeneTypePayload(approvedGene);
          } else {
            const args = pathToGetEvidenceArgs({
              gene: approvedGene,
              valuePath: reviewLevel.valuePath,
              updateTime: new Date().getTime(),
              drugListRef,
              entrezGeneId,
            });
            if (args !== undefined) {
              evidences = {
                ...evidences,
                ...getEvidence(args),
              };
              hasEvidences = true;
            }
          }
        }
      }
    } catch (error) {
      const sentryError = new SentryError('Failed to create evidences when accepting changes in review mode', {
        hugoSymbol,
        reviewLevels,
        isGermline,
        error,
      });
      if (AppConfig.serverConfig.frontend?.stopReviewIfCoreSubmissionFails) {
        throw sentryError;
      } else {
        console.error(sentryError);
      }
    }

    try {
      if (geneTypePayload) {
        await this.geneTypeClient.submitGeneTypeToCore(geneTypePayload);
      }
    } catch (error) {
      const sentryError = new SentryError('Failed to submit evidences to core when accepting changes in review mode', {
        hugoSymbol,
        reviewLevels,
        isGermline,
        error,
      });
      if (AppConfig.serverConfig.frontend?.stopReviewIfCoreSubmissionFails) {
        throw sentryError;
      } else {
        console.error(sentryError);
      }
    }

    try {
      if (hasEvidences) {
        await this.evidenceClient.submitEvidences(evidences);
      }
    } catch (error) {
      const sentryError = new SentryError('Failed to submit evidences to core when accepting changes in review mode', {
        hugoSymbol,
        reviewLevels,
        isGermline,
        error,
      });
      if (AppConfig.serverConfig.frontend?.stopReviewIfCoreSubmissionFails) {
        throw sentryError;
      } else {
        console.error(sentryError);
      }
    }

    let updateObject = {};

    const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, reviewLevels);
    const historyUpdateObject = this.firebaseHistoryService.getUpdateObject(reviewHistory, hugoSymbol, isGermline);

    updateObject = { ...updateObject, ...historyUpdateObject };

    for (const reviewLevel of reviewLevels) {
      const { uuid, reviewAction, review, reviewPath } = reviewLevel.reviewInfo;
      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        clearReview(review);
        updateObject[`${firebaseGenePath}/${reviewPath}`] = review;
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo?.reviewPath;
          updateObject[`${firebaseGenePath}/${excludedCtReviewPath}`] = review;
        }
      } else if (isDeleteReview(reviewLevel)) {
        itemsToDelete = updateItemsToDeleteMap(itemsToDelete, reviewLevel, firebaseGenePath);
        if (review.demotedToVus) {
          const variants = parseAlterationName(reviewLevel.currentVal)[0]
            .alteration.split(',')
            .map(alt => alt.trim());
          updateObject = { ...updateObject, ...this.firebaseVusService.getVusUpdateObject(firebaseVusPath, variants) };
        }
      } else if (isCreateReview(reviewLevel) && isAcceptAll) {
        const createUpdateObject = await this.getCreateUpdateObject(hugoSymbol, reviewLevel, isGermline, ActionType.ACCEPT);
        updateObject = { ...updateObject, ...createUpdateObject };
      } else {
        throw new SentryError('Unexpect accept in review mode', { hugoSymbol, reviewLevel, isGermline, isAcceptAll });
      }

      const metaUpdateObject = this.firebaseMetaService.getUpdateObject(false, hugoSymbol, isGermline, uuid);
      updateObject = { ...updateObject, ...metaUpdateObject };
    }

    try {
      await this.firebaseRepository.update('/', updateObject);
    } catch (error) {
      throw new SentryError('Failed to accept changes in review mode', {
        hugoSymbol,
        reviewLevels,
        isGermline,
        isAcceptAll,
        updateObject,
      });
    }

    // We are deleting last because the indices will change after deleting from array.
    let hasDeletion = false;
    try {
      // Todo: We should use multi-location updates for deletions once all our arrays use firebase auto-generated keys
      // instead of using sequential number indices.
      for (const pathType of [
        FIREBASE_LIST_PATH_TYPE.TREATMENT_LIST,
        FIREBASE_LIST_PATH_TYPE.TUMOR_LIST,
        FIREBASE_LIST_PATH_TYPE.MUTATION_LIST,
      ]) {
        for (const [firebasePath, deleteIndices] of Object.entries(itemsToDelete[pathType])) {
          hasDeletion = true;
          await this.firebaseRepository.deleteFromArray(firebasePath, deleteIndices);
        }
      }
      // If user accepts a deletion individually, we need to refresh the ReviewPage with the latest data to make sure the indices are up to date.
      if (reviewLevels.length === 1 && hasDeletion) {
        return { shouldRefresh: true };
      }
    } catch (error) {
      throw new SentryError('Failed to accept deletions in review mode', { hugoSymbol, reviewLevels, isGermline, itemsToDelete });
    }

    return this.processDeletion(reviewLevels.length, itemsToDelete);
  };

  rejectChanges = async (
    hugoSymbol: string,
    reviewLevels: ReviewLevel[],
    isGermline: boolean,
  ): Promise<
    | {
        shouldRefresh: boolean;
      }
    | undefined
    | void
  > => {
    const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const firebaseVusPath = getFirebaseVusPath(isGermline, hugoSymbol);

    let itemsToDelete: ItemsToDeleteMap = {
      [FIREBASE_LIST_PATH_TYPE.MUTATION_LIST]: {},
      [FIREBASE_LIST_PATH_TYPE.TUMOR_LIST]: {},
      [FIREBASE_LIST_PATH_TYPE.TREATMENT_LIST]: {},
    };

    let updateObject = {};

    for (const reviewLevel of reviewLevels) {
      const fieldPath = reviewLevel.valuePath;
      const { uuid, review, reviewPath, reviewAction } = reviewLevel.reviewInfo;

      const resetReview = new Review(this.authStore.fullName);
      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        const reviewLevelUpdateObject = {
          [`${firebaseGenePath}/${reviewPath}`]: resetReview,
          // When user rejects the initial excludedRCTs, then excludedRCTs field should be cleared.
          [`${firebaseGenePath}/${fieldPath}`]: review.initialUpdate || review.lastReviewed === undefined ? null : review.lastReviewed,
        };
        updateObject = { ...updateObject, ...reviewLevelUpdateObject };
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo?.reviewPath;
          const excludedCtPath = excludedCtReviewPath?.replace('_review', '');
          updateObject[`${firebaseGenePath}/${excludedCtReviewPath}`] = resetReview;
          updateObject[`${firebaseGenePath}/${excludedCtPath}`] = tumorReviewLevel.excludedCancerTypesReviewInfo?.review.initialUpdate
            ? null
            : tumorReviewLevel.excludedCancerTypesReviewInfo?.review.lastReviewed;
        }
      } else if (isDeleteReview(reviewLevel)) {
        updateObject[`${firebaseGenePath}/${reviewPath}`] = resetReview;
      } else if (isCreateReview(reviewLevel)) {
        itemsToDelete = updateItemsToDeleteMap(itemsToDelete, reviewLevel, firebaseGenePath);
        if (review.promotedToMutation) {
          const variants = parseAlterationName(reviewLevel.currentVal)[0]
            .alteration.split(',')
            .map(alt => alt.trim());
          updateObject = { ...updateObject, ...this.firebaseVusService.getVusUpdateObject(firebaseVusPath, variants) };
        }
      } else {
        throw new SentryError('Unexpected reject in review mode', { hugoSymbol, reviewLevels, isGermline });
      }

      const metaUpdateObject = this.firebaseMetaService.getUpdateObject(false, hugoSymbol, isGermline, uuid);
      updateObject = { ...updateObject, ...metaUpdateObject };

      try {
        await this.firebaseRepository.update('/', updateObject);
      } catch (error) {
        throw new SentryError('Failed to reject changes in review mode', { hugoSymbol, reviewLevels, isGermline, updateObject });
      }
    }

    return this.processDeletion(reviewLevels.length, itemsToDelete);
  };

  // Creation accepts/rejects are triggered when the Create Collapsible has no more children.
  // It can also be triggered using the accept all button.
  handleCreateAction = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean, action: ActionType) => {
    let updateObject = await this.getCreateUpdateObject(hugoSymbol, reviewLevel, isGermline, action);
    updateObject = {
      ...updateObject,
      ...this.firebaseMetaService.getUpdateObject(false, hugoSymbol, isGermline, reviewLevel.reviewInfo.uuid),
    };
    try {
      await this.firebaseRepository.update('/', updateObject);
    } catch (error) {
      throw new SentryError('Failed to save newly created entity', { hugoSymbol, reviewLevel, isGermline, action });
    }
  };

  getCreateUpdateObject = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean, action: ActionType) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);

    let updateObject = {};

    if (action === ActionType.ACCEPT) {
      const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, [reviewLevel]);
      const historyUpdateObject = this.firebaseHistoryService.getUpdateObject(reviewHistory, hugoSymbol, isGermline);
      updateObject = { ...updateObject, ...historyUpdateObject };

      const pathParts = reviewLevel.valuePath.split('/');
      pathParts.pop(); // Remove name or cancerTypes
      clearAllNestedReviews(reviewLevel.historyData.newState);

      updateObject[`${geneFirebasePath}/${pathParts.join('/')}`] = reviewLevel.historyData.newState;
      updateObject = { ...updateObject, ...this.getDeletedUuidUpdateObject(hugoSymbol, reviewLevel, isGermline) };
    } else if (action === ActionType.REJECT) {
      const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
      const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
      try {
        // Todo: We should use multi-location updates for deletions once all our arrays use firebase auto-generated keys
        // instead of using sequential number indices.
        await this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]);
      } catch (error) {
        throw new SentryError('Failed to reject creation in review mode', { hugoSymbol, reviewLevel, isGermline });
      }

      if (reviewLevel.reviewInfo.review.promotedToMutation) {
        const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
        updateObject = { ...updateObject, ...this.firebaseVusService.getVusUpdateObject(vusFirebasePath, variants) };
      }
    }

    return updateObject;
  };

  getDeletedUuidUpdateObject = (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) => {
    const metaGenePath = getFirebaseMetaGenePath(isGermline, hugoSymbol);
    const uuids: string[] = [];
    getAllNestedReviewUuids(reviewLevel, uuids);
    return uuids.reduce((acc, uuid) => {
      acc[`${metaGenePath}/review/${uuid}`] = null;
      return acc;
    }, {});
  };

  processDeletion = async (reviewLevelLength: number, itemsToDelete: ItemsToDeleteMap) => {
    // We are deleting last because the indices will change after deleting from array.
    let hasDeletion = false;
    try {
      // Todo: We should use multi-location updates for deletions once all our arrays use firebase auto-generated keys
      // instead of using sequential number indices.
      for (const pathType of [
        FIREBASE_LIST_PATH_TYPE.TREATMENT_LIST,
        FIREBASE_LIST_PATH_TYPE.TUMOR_LIST,
        FIREBASE_LIST_PATH_TYPE.MUTATION_LIST,
      ]) {
        for (const [firebasePath, deleteIndices] of Object.entries(itemsToDelete[pathType])) {
          hasDeletion = true;
          await this.firebaseRepository.deleteFromArray(firebasePath, deleteIndices);
        }
      }
      // If user accepts a deletion individually, we need to refresh the ReviewPage with the latest data to make sure the indices are up to date.
      if (reviewLevelLength === 1 && hasDeletion) {
        return { shouldRefresh: true };
      }
    } catch (error) {
      throw new SentryError('Failed to accept deletions in review mode', { itemsToDelete });
    }
  };
}
