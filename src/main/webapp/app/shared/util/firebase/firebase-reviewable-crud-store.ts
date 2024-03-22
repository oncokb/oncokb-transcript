import { IRootStore } from 'app/stores';
import { ref, remove, update } from 'firebase/database';
import { action, makeObservable } from 'mobx';
import { Review } from '../../model/firebase/firebase.model';
import { generateUuid } from '../utils';
import { FirebaseCrudStore } from './firebase-crud-store';
import { buildHistoryFromReviews } from './firebase-history-utils';
import { parseFirebaseGenePath } from './firebase-path-utils';
import { ReviewAction, ReviewLevel, clearAllNestedReviews, getAllNestedReviewUuids } from './firebase-review-utils';
import { getFirebaseGenePath } from './firebase-utils';
import _ from 'lodash';

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
      delete oldReview.lastReviewed;
    }
  } else {
    if (_.isEqual(oldReview.lastReviewed, newValue)) {
      delete oldReview.lastReviewed;
      isChangeReverted = true;
    }
  }
  return { updatedReview: oldReview, isChangeReverted };
};

/* eslint-disable @typescript-eslint/ban-types */
export class FirebaseReviewableCrudStore<T extends object> extends FirebaseCrudStore<T> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateReviewableContent: action.bound,
      acceptChanges: action.bound,
      rejectChanges: action.bound,
    });
  }

  updateReviewableContent = (firebasePath: string, currentValue: any, updateValue: any, review: Review, uuid: string) => {
    const isGermline = firebasePath.toLowerCase().includes('germline');

    const { updatedReview, isChangeReverted } = getUpdatedReview(review, currentValue, updateValue, this.rootStore.authStore.fullName);

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

    return update(ref(this.db, getFirebaseGenePath(isGermline, hugoSymbol)), updateObject).then(() => {
      if (isChangeReverted) {
        remove(ref(this.db, `${firebasePath}_review/lastReviewed`));
      }
      // Update Meta information
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, isGermline);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, !isChangeReverted, isGermline);
    });
  };

  async acceptChanges(hugoSymbol: string, reviewLevels: ReviewLevel[], isGermline: boolean) {
    const geneFirebasePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const reviewHistory = buildHistoryFromReviews(this.rootStore.authStore.fullName, reviewLevels);

    return this.rootStore.firebaseHistoryStore.addHistory(hugoSymbol, reviewHistory, isGermline).then(() => {
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
          update(ref(this.db, geneFirebasePath), { [reviewPath]: reviewObject }).then(() => {
            this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
          });
        }

        if (reviewLevel.reviewAction === ReviewAction.DELETE) {
          const pathParts = reviewLevel.currentValPath.split('/');
          pathParts.pop(); // Remove key
          const deleteIndex = parseInt(pathParts.pop(), 10); // Remove index
          const firebasePath = geneFirebasePath + '/' + pathParts.join('/');
          this.deleteFromArray(firebasePath, [deleteIndex]).then(() =>
            this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline)
          );
        }

        if (reviewLevel.reviewAction === ReviewAction.CREATE) {
          const pathParts = reviewLevel.currentValPath.split('/');
          pathParts.pop(); // Remove name or cancerTypes
          clearAllNestedReviews(reviewLevel.newState);
          update(ref(this.db, geneFirebasePath), { [pathParts.join('/')]: reviewLevel.newState }).then(() => {
            // Delete all uuids from meta collection
            const uuids = [];
            getAllNestedReviewUuids(reviewLevel, uuids);
            uuids.forEach(id => {
              this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, id, false, isGermline);
            });
          });
        }
      }
    });
  }

  async rejectChanges(hugoSymbol: string, reviewLevel: ReviewLevel, isGermline: boolean) {
    const uuid = reviewLevel.uuid;
    const fieldPath = reviewLevel.currentValPath;
    const reviewPath = reviewLevel.reviewPath;
    const reviewObject = reviewLevel.review;

    const updateMetaCallback = () => {
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol, isGermline);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, false, isGermline);
    };

    if (reviewLevel.reviewAction === ReviewAction.UPDATE || reviewLevel.reviewAction === ReviewAction.NAME_CHANGE) {
      const resetReview = new Review(this.rootStore.authStore.fullName);
      return update(ref(this.db, getFirebaseGenePath(isGermline, hugoSymbol)), {
        [reviewPath]: resetReview,
        [fieldPath]: reviewObject.lastReviewed,
      }).then(() => {
        updateMetaCallback();
      });
    }

    reviewObject.updateTime = new Date().getTime();
    reviewObject.updatedBy = this.rootStore.authStore.fullName;
    if (reviewLevel.reviewAction === ReviewAction.DELETE) {
      delete reviewObject.removed;
    }
    if (reviewLevel.reviewAction === ReviewAction.CREATE) {
      delete reviewObject.added;
    }
    return update(ref(this.db, getFirebaseGenePath(isGermline, hugoSymbol)), { [reviewPath]: reviewObject }).then(() => {
      updateMetaCallback();
    });
  }
}
