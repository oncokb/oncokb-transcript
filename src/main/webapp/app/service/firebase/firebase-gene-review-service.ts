import { ReviewAction } from 'app/config/constants/firebase';
import { FirebaseHistoryService } from 'app/service/firebase/firebase-history-service';
import { FirebaseMetaService } from 'app/service/firebase/firebase-meta-service';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';
import { Review, Vus } from '../../shared/model/firebase/firebase.model';
import { buildHistoryFromReviews } from '../../shared/util/firebase/firebase-history-utils';
import { extractArrayPath, parseFirebaseGenePath } from '../../shared/util/firebase/firebase-path-utils';
import {
  ReviewLevel,
  clearAllNestedReviews,
  clearReview,
  getAllNestedReviewUuids,
  getUpdatedReview,
} from '../../shared/util/firebase/firebase-review-utils';
import { getFirebaseGenePath, getFirebaseVusPath } from '../../shared/util/firebase/firebase-utils';
import { generateUuid, parseAlterationName } from '../../shared/util/utils';
import { FirebaseVusService } from './firebase-vus-service';
import { SentryError } from 'app/config/sentry-error';

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

  updateReviewableContent = async (firebasePath: string, currentValue: any, updateValue: any, review: Review, uuid: string) => {
    const isGermline = firebasePath.toLowerCase().includes('germline');

    const { updatedReview, isChangeReverted } = getUpdatedReview(review, currentValue, updateValue, this.authStore.fullName);

    const { hugoSymbol, pathFromGene } = parseFirebaseGenePath(firebasePath);

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

  acceptChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => {
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
        if (reviewLevel.nestedUnderCreateOrDelete) {
          continue;
        }
        clearReview(review);
        try {
          await this.firebaseRepository.update(geneFirebasePath, { [reviewPath]: review });
          await this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed update when accepting changes in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }

      if (reviewAction === ReviewAction.DELETE || reviewAction === ReviewAction.DEMOTE_MUTATION) {
        const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
        const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
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

      if (reviewAction === ReviewAction.CREATE || reviewAction === ReviewAction.PROMOTE_VUS) {
        const pathParts = reviewLevel.valuePath.split('/');
        pathParts.pop(); // Remove name or cancerTypes
        clearAllNestedReviews(reviewLevel.historyData.newState);
        try {
          await this.firebaseRepository.update(geneFirebasePath, { [pathParts.join('/')]: reviewLevel.historyData.newState });
          await this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
        } catch (error) {
          throw new SentryError('Failed to accept creation in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }
    }
  };

  rejectChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);

    for (const reviewLevel of reviewLevels) {
      const fieldPath = reviewLevel.valuePath;
      const { uuid, review, reviewPath, reviewAction } = reviewLevel.reviewInfo;

      if (reviewAction === ReviewAction.UPDATE || reviewAction === ReviewAction.NAME_CHANGE) {
        const resetReview = new Review(this.authStore.fullName);
        try {
          await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), {
            [reviewPath]: resetReview,
            [fieldPath]: review.lastReviewed,
          });
          await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed to reject updates in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }

      review.updateTime = new Date().getTime();
      review.updatedBy = this.authStore.fullName;
      if (reviewAction === ReviewAction.DELETE || reviewAction === ReviewAction.DEMOTE_MUTATION) {
        clearReview(review);
        try {
          await this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), { [reviewPath]: review });
          await this.firebaseMetaService.updateMeta(hugoSymbol, uuid, false, isGermline);
        } catch (error) {
          throw new SentryError('Failed to reject deletion in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
      }

      if (reviewAction === ReviewAction.CREATE || reviewAction === ReviewAction.PROMOTE_VUS) {
        const { firebaseArrayPath, deleteIndex } = extractArrayPath(reviewLevel.valuePath);
        const firebasePath = geneFirebasePath + '/' + firebaseArrayPath;
        try {
          await this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]);
          await this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
          if (review.promotedToMutation) {
            const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
            await this.firebaseVusService.addVus(vusFirebasePath, variants);
          }
        } catch (error) {
          throw new SentryError('Failed to reject creation in review mode', { hugoSymbol, reviewLevel, isGermline });
        }
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
