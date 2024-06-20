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
import { getFirebaseGenePath, getFirebaseVusPath } from '../../shared/util/firebase/firebase-utils';
import { generateUuid, parseAlterationName } from '../../shared/util/utils';
import { FirebaseVusService } from './firebase-vus-service';
import { SentryError } from 'app/config/sentry-error';
import { ActionType } from 'app/pages/curation/collapsible/ReviewCollapsible';
import { GERMLINE_PATH } from 'app/config/constants/constants';

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

  updateReviewableContent = async (
    firebasePath: string,
    currentValue: any,
    updateValue: any,
    review: Review | null | undefined,
    uuid: string | null,
    updateMetaData: boolean = true,
  ) => {
    const isGermline = firebasePath.toLowerCase().includes('germline');

    const { updatedReview, isChangeReverted } = getUpdatedReview(
      review,
      currentValue,
      updateValue,
      this.authStore.fullName,
      updateMetaData,
    );

    const { hugoSymbol, pathFromGene } = parseFirebaseGenePath(firebasePath) ?? {};

    if (!pathFromGene) {
      throw new SentryError('Path from Gene is empty', { pathFromGene });
    } else if (!hugoSymbol) {
      throw new SentryError('Hugo symbol is empty', { pathFromGene });
    }

    const updateObject = {
      [pathFromGene]: updateValue,
      [`${pathFromGene}_review`]: updatedReview,
    };

    // Make sure that there is a UUID attached
    if (!uuid) {
      uuid = generateUuid();
      updateObject[`${pathFromGene}_uuid`] = uuid;
    }

    try {
      await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), updateObject);
      await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, !isChangeReverted, isGermline);
    } catch (error) {
      throw new SentryError('Failed to update reviewable content', { firebasePath, currentValue, updateValue, review, uuid });
    }
  };

  acceptChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean, isAcceptAll = false) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);

    const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, reviewLevels);
    try {
      await this.firebaseHistoryService.addHistory(hugoSymbol, reviewHistory, isGermline);
    } catch (error) {
      throw new SentryError('Failed save history when accepting changes in review mode', { hugoSymbol, reviewLevels, isGermline });
    }

    for (const reviewLevel of reviewLevels) {
      const { uuid, reviewAction, review, reviewPath } = reviewLevel.reviewInfo;

      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        clearReview(review);
        const updateObject: Record<string, Review | undefined> = { [reviewPath]: review };
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo?.reviewPath;
          if (excludedCtReviewPath) {
            updateObject[excludedCtReviewPath] = review;
          }
        }
        if (!uuid) {
          throw new SentryError('UUID is missing', { hugoSymbol, reviewLevel, isGermline });
        }
        try {
          await this.firebaseRepository.update(geneFirebasePath, updateObject);
          await this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed update when accepting changes in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }

      if (isDeleteReview(reviewLevel)) {
        const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
        const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
        if (!review) {
          throw new SentryError('Review is missing', { hugoSymbol, reviewLevel, isGermline });
        }
        if (!uuid) {
          throw new SentryError('UUID is missing', { hugoSymbol, reviewLevel, isGermline });
        }
        try {
          await this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]);
          await this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
          // Add the demoted mutation to VUS list
          if (review.demotedToVus) {
            const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
            await this.firebaseVusService.addVus(vusFirebasePath, variants);
          }
        } catch (error) {
          throw new SentryError('Failed to accept deletion in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }

      if (isCreateReview(reviewLevel) && isAcceptAll) {
        await this.handleCreateAction(hugoSymbol, reviewLevel, isGermline, ActionType.ACCEPT);
      }
    }
  };

  rejectChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => {
    for (const reviewLevel of reviewLevels) {
      const fieldPath = reviewLevel.valuePath;
      const { uuid, review, reviewPath, reviewAction } = reviewLevel.reviewInfo;

      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        const resetReview = new Review(this.authStore.fullName);
        const updateObject = {
          [reviewPath]: resetReview,
          [fieldPath]: review?.lastReviewed,
        };
        if ('excludedCancerTypesReviewInfo' in reviewLevel && 'currentExcludedCancerTypes' in reviewLevel) {
          const tumorReviewLevel = reviewLevel as TumorReviewLevel;
          const excludedCtReviewPath = tumorReviewLevel.excludedCancerTypesReviewInfo?.reviewPath;
          const excludedCtPath = excludedCtReviewPath?.replace('_review', '');
          if (excludedCtReviewPath) {
            updateObject[excludedCtReviewPath] = resetReview;
          }
          if (excludedCtPath) {
            updateObject[excludedCtPath] = tumorReviewLevel.excludedCancerTypesReviewInfo?.review?.lastReviewed;
          }
        }
        if (!uuid) {
          throw new SentryError('UUID is missing', { hugoSymbol, reviewLevel, isGermline });
        }
        try {
          await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), updateObject);
          await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed to reject updates in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }
      if (!review) {
        throw new SentryError('Review is missing', { hugoSymbol, reviewLevel, isGermline });
      }

      review.updateTime = new Date().getTime();
      review.updatedBy = this.authStore.fullName;
      if (isDeleteReview(reviewLevel)) {
        clearReview(review);
        if (!uuid) {
          throw new SentryError('UUID is missing', { hugoSymbol, reviewLevel, isGermline });
        }
        try {
          await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), { [reviewPath]: review });
          await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed to reject deletion in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }
    }
  };

  // Creation accepts/rejects are triggered when the Create Collapsible has no more children.
  // It can also be triggered using the accept all button.
  handleCreateAction = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean, action: ActionType) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);
    if (action === ActionType.ACCEPT) {
      const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, [reviewLevel]);
      try {
        await this.firebaseHistoryService.addHistory(hugoSymbol, reviewHistory, isGermline);
      } catch (error) {
        throw new SentryError('Failed save history when accepting changes in review mode', { hugoSymbol, reviewLevel, isGermline });
      }
      const pathParts = reviewLevel.valuePath.split('/');
      pathParts.pop(); // Remove name or cancerTypes
      clearAllNestedReviews(reviewLevel.historyData.newState);
      try {
        await this.firebaseRepository.update(geneFirebasePath, { [pathParts.join('/')]: reviewLevel.historyData.newState });
        await this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
      } catch (error) {
        throw new SentryError('Failed to accept creation in review mode', { hugoSymbol, reviewLevel, isGermline });
      }
    } else if (action === ActionType.REJECT) {
      const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
      const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
      try {
        await this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]);
        await this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
        if (reviewLevel.reviewInfo.review?.promotedToMutation) {
          const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
          await this.firebaseVusService.addVus(vusFirebasePath, variants);
        }
      } catch (error) {
        throw new SentryError('Failed to reject creation in review mode', { hugoSymbol, reviewLevel, isGermline });
      }
    }
  };

  deleteAllNestedUuids = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) => {
    // Delete all uuids from meta collection
    const uuids = [];
    getAllNestedReviewUuids(reviewLevel, uuids);
    for (const uuid of uuids) {
      await this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
    }
  };
}
