import { ReviewAction } from 'app/config/constants/firebase';
import { FirebaseHistoryService } from 'app/service/firebase/firebase-history-service';
import { FirebaseMetaService } from 'app/service/firebase/firebase-meta-service';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';
import { Review } from '../../shared/model/firebase/firebase.model';
import { buildHistoryFromReviews } from '../../shared/util/firebase/firebase-history-utils';
import { extractArrayPath, parseFirebaseGenePath } from '../../shared/util/firebase/firebase-path-utils';
import {
  ReviewLevel,
  TumorReviewLevel,
  clearAllNestedReviews,
  clearReview,
  getAllNestedReviewUuids,
  getUpdatedReview,
  isCreateReview,
  isDeleteReview,
} from '../../shared/util/firebase/firebase-review-utils';
import { getFirebaseGenePath, getFirebaseMetaGenePath, getFirebaseVusPath } from '../../shared/util/firebase/firebase-utils';
import { generateUuid, parseAlterationName } from '../../shared/util/utils';
import { FirebaseVusService } from './firebase-vus-service';
import { SentryError } from 'app/config/sentry-error';
import { ActionType } from 'app/pages/curation/collapsible/ReviewCollapsible';

export class FirebaseGeneReviewService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;
  firebaseMetaService: FirebaseMetaService;
  firebaseHistoryService: FirebaseHistoryService;
  firebaseVusService: FirebaseVusService;

  constructor(
    firebaseRepository: FirebaseRepository,
    authStore: AuthStore,
    firebaseMetaService: FirebaseMetaService,
    firebaseHistoryService: FirebaseHistoryService,
    firebaseVusService: FirebaseVusService,
  ) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
    this.firebaseMetaService = firebaseMetaService;
    this.firebaseHistoryService = firebaseHistoryService;
    this.firebaseVusService = firebaseVusService;
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
    review: Review,
    uuid: string,
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

    const { hugoSymbol } = parseFirebaseGenePath(firebasePath);

    let updateObject = this.getGeneUpdateObject(updateValue, updatedReview, firebasePath, uuid);
    const metaUpdateObject = this.firebaseMetaService.getUpdateObject(!isChangeReverted, hugoSymbol, isGermline, uuid);
    updateObject = { ...updateObject, ...metaUpdateObject };

    if (!shouldSave) {
      return updateObject;
    }

    try {
      await this.firebaseRepository.update('/', updateObject);
    } catch (error) {
      throw new SentryError('Failed to update reviewable content', updateObject);
    }
  };

  acceptChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean, isAcceptAll = false) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);

    let updateObject = {};

    const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, reviewLevels);
    const historyUpdateObject = this.firebaseHistoryService.getUpdateObject(reviewHistory, hugoSymbol, isGermline);

    updateObject = { ...updateObject, ...historyUpdateObject };

    for (const reviewLevel of reviewLevels) {
      const { uuid, reviewAction, review, reviewPath } = reviewLevel.reviewInfo;
      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        clearReview(review);
        updateObject[`${geneFirebasePath}/${reviewPath}`] = review;
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo.reviewPath;
          updateObject[`${geneFirebasePath}/${excludedCtReviewPath}`] = review;
        }
      } else if (isDeleteReview(reviewLevel)) {
        const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
        const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
        if (review.demotedToVus) {
          const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
          updateObject = { ...updateObject, ...this.firebaseVusService.getVusUpdateObject(vusFirebasePath, variants) };
        }
        try {
          // Todo: We should use multi-location updates for deletions once all our arrays use firebase auto-generated keys
          // instead of using sequential number indices.
          await this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]);
        } catch (error) {
          throw new SentryError('Failed to accept deletion in review mode', { hugoSymbol, reviewLevel, isGermline });
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
      throw new SentryError('Failed to accept changes in review mode', { hugoSymbol, reviewLevels, isGermline, isAcceptAll, updateObject });
    }
  };

  rejectChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => {
    const firebaseGenePath = getFirebaseGenePath(isGermline, hugoSymbol);
    let updateObject = {};

    for (const reviewLevel of reviewLevels) {
      const fieldPath = reviewLevel.valuePath;
      const { uuid, review, reviewPath, reviewAction } = reviewLevel.reviewInfo;

      const resetReview = new Review(this.authStore.fullName);
      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        const reviewLevelUpdateObject = {
          [`${firebaseGenePath}/${reviewPath}`]: resetReview,
          [`${firebaseGenePath}/${fieldPath}`]: review.lastReviewed,
        };
        updateObject = { ...updateObject, ...reviewLevelUpdateObject };
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo.reviewPath;
          const excludedCtPath = excludedCtReviewPath.replace('_review', '');
          updateObject[`${firebaseGenePath}/${excludedCtReviewPath}`] = resetReview;
          updateObject[`${firebaseGenePath}/${excludedCtPath}`] = tumorReviewLevel.excludedCancerTypesReviewInfo.review.lastReviewed;
        }
      } else if (isDeleteReview(reviewLevel)) {
        updateObject[`${firebaseGenePath}/${reviewPath}`] = resetReview;
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
  };

  // Creation accepts/rejects are triggered when the Create Collapsible has no more children.
  // It can also be triggered using the accept all button.
  handleCreateAction = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean, action: ActionType) => {
    let updateObject = await this.getCreateUpdateObject(hugoSymbol, reviewLevel, isGermline, action);
    updateObject = {
      ...updateObject,
      ...this.firebaseMetaService.getUpdateObject(action === ActionType.ACCEPT, hugoSymbol, isGermline, reviewLevel.reviewInfo.uuid),
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
    const uuids = [];
    getAllNestedReviewUuids(reviewLevel, uuids);
    return uuids.reduce((acc, uuid) => {
      acc[`${metaGenePath}/${uuid}`] = null;
      return acc;
    }, {});
  };
}
