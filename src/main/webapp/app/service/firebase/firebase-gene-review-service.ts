import { ReviewAction } from 'app/config/constants/firebase';
import { FirebaseHistoryService } from 'app/service/firebase/firebase-history-service';
import { FirebaseMetaService } from 'app/service/firebase/firebase-meta-service';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';
import { Review, Vus } from '../../shared/model/firebase/firebase.model';
import { buildHistoryFromReviews } from '../../shared/util/firebase/firebase-history-utils';
import { parseFirebaseGenePath } from '../../shared/util/firebase/firebase-path-utils';
import { ReviewLevel, clearAllNestedReviews, clearReview, getAllNestedReviewUuids } from '../../shared/util/firebase/firebase-review-utils';
import { getFirebaseGenePath, getFirebaseVusPath } from '../../shared/util/firebase/firebase-utils';
import { generateUuid, parseAlterationName } from '../../shared/util/utils';

export const getUpdatedReview = (oldReview: Review, currentValue: any, newValue: any, editorName: string) => {
  // Update Review
  if (!oldReview) {
    oldReview = new Review(editorName);
  }
  oldReview.updateTime = new Date().getTime();
  oldReview.updatedBy = editorName;

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

  if (isChangeReverted) {
    oldReview = clearReview(oldReview);
  }

  return { updatedReview: oldReview, isChangeReverted };
};

/* eslint-disable @typescript-eslint/ban-types */
export class FirebaseGeneReviewService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;
  firebaseMetaService: FirebaseMetaService;
  firebaseHistoryService: FirebaseHistoryService;

  constructor(
    firebaseRepository: FirebaseRepository,
    authStore: AuthStore,
    firebaseMetaService: FirebaseMetaService,
    firebaseHistoryService: FirebaseHistoryService
  ) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
    this.firebaseMetaService = firebaseMetaService;
    this.firebaseHistoryService = firebaseHistoryService;
  }

  updateReviewableContent = (firebasePath: string, currentValue: any, updateValue: any, review: Review, uuid: string) => {
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

    return this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), updateObject).then(() => {
      if (isChangeReverted) {
        this.firebaseRepository.delete(`${firebasePath}_review/lastReviewed`);
      }
      // Update Meta information
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, !isChangeReverted, isGermline);
    });
  };

  acceptChanges = async (hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);
    const reviewHistory = buildHistoryFromReviews(this.authStore.fullName, reviewLevels);

    return this.firebaseHistoryService.addHistory(hugoSymbol, reviewHistory, isGermline).then(() => {
      for (const reviewLevel of reviewLevels) {
        const uuid = reviewLevel.uuid;
        const reviewPath = reviewLevel.reviewPath;
        const reviewObject = reviewLevel.review;

        if (reviewLevel.reviewAction === ReviewAction.UPDATE || reviewLevel.reviewAction === ReviewAction.NAME_CHANGE) {
          if (reviewLevel.isUnderCreationOrDeletion) {
            continue;
          }
          delete reviewObject.initialUpdate;
          delete reviewObject.lastReviewed;
          this.firebaseRepository.update(geneFirebasePath, { [reviewPath]: reviewObject }).then(() => {
            this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
          });
        }

        if (reviewLevel.reviewAction === ReviewAction.DELETE || reviewLevel.reviewAction === ReviewAction.DEMOTE_MUTATION) {
          const pathParts = reviewLevel.currentValPath.split('/');
          pathParts.pop(); // Remove key
          const deleteIndex = parseInt(pathParts.pop(), 10); // Remove index
          const firebasePath = geneFirebasePath + '/' + pathParts.join('/');
          this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]).then(() => {
            this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
            // Add the demoted mutation to VUS list
            if (reviewObject.demotedToVus) {
              const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
              const newVusList = variants.map(variant => {
                return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
              });
              this.firebaseRepository.pushMultiple(vusFirebasePath, newVusList);
            }
          });
        }

        if (reviewLevel.reviewAction === ReviewAction.CREATE || reviewLevel.reviewAction === ReviewAction.PROMOTE_VUS) {
          const pathParts = reviewLevel.currentValPath.split('/');
          pathParts.pop(); // Remove name or cancerTypes
          clearAllNestedReviews(reviewLevel.newState);
          this.firebaseRepository.update(geneFirebasePath, { [pathParts.join('/')]: reviewLevel.newState }).then(() => {
            // Delete all uuids from meta collection
            this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
          });
        }
      }
    });
  };

  rejectChanges = async (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) => {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const vusFirebasePath = getFirebaseVusPath(isGermline, hugoSymbol);
    const uuid = reviewLevel.uuid;
    const fieldPath = reviewLevel.currentValPath;
    const reviewPath = reviewLevel.reviewPath;
    const reviewObject = reviewLevel.review;

    const updateMetaCallback = () => {
      this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
    };

    if (reviewLevel.reviewAction === ReviewAction.UPDATE || reviewLevel.reviewAction === ReviewAction.NAME_CHANGE) {
      const resetReview = new Review(this.authStore.fullName);
      return this.firebaseRepository
        .update(getFirebaseGenePath(isGermline, hugoSymbol), {
          [reviewPath]: resetReview,
          [fieldPath]: reviewObject.lastReviewed,
        })
        .then(() => {
          updateMetaCallback();
        });
    }

    reviewObject.updateTime = new Date().getTime();
    reviewObject.updatedBy = this.authStore.fullName;
    if (reviewLevel.reviewAction === ReviewAction.DELETE || reviewLevel.reviewAction === ReviewAction.DEMOTE_MUTATION) {
      delete reviewObject.removed;
      delete reviewObject.demotedToVus;
    }
    if (reviewLevel.reviewAction === ReviewAction.CREATE || reviewLevel.reviewAction === ReviewAction.PROMOTE_VUS) {
      const pathParts = reviewLevel.currentValPath.split('/');
      pathParts.pop(); // Remove key
      const deleteIndex = parseInt(pathParts.pop(), 10); // Remove index
      const firebasePath = geneFirebasePath + '/' + pathParts.join('/');
      return this.firebaseRepository.deleteFromArray(firebasePath, [deleteIndex]).then(() => {
        this.deleteAllNestedUuids(hugoSymbol, reviewLevel, isGermline);
        if (reviewObject.promotedToMutation) {
          const variants = parseAlterationName(reviewLevel.currentVal)[0].alteration.split(', ');
          const newVusList = variants.map(variant => {
            return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
          });
          this.firebaseRepository.pushMultiple(vusFirebasePath, newVusList);
        }
      });
    }
    return this.firebaseRepository.update(getFirebaseGenePath(isGermline, hugoSymbol), { [reviewPath]: reviewObject }).then(() => {
      updateMetaCallback();
    });
  };

  deleteAllNestedUuids = (hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) => {
    // Delete all uuids from meta collection
    const uuids = [];
    getAllNestedReviewUuids(reviewLevel, uuids);
    uuids.forEach(id => {
      this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, id, false, isGermline);
    });
  };
}
