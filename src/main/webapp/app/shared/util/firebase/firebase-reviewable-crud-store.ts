import { IRootStore } from 'app/stores';
import { ref, remove, update } from 'firebase/database';
import { action, makeObservable } from 'mobx';
import { Review } from '../../model/firebase/firebase.model';
import { getValueByNestedKey } from './firebase-utils';
import { FirebaseCrudStore, RecursiveKeyOf } from './firebase-crud-store';
import { generateUuid } from '../utils';

/* eslint-disable @typescript-eslint/ban-types */
export class FirebaseReviewableCrudStore<T extends object> extends FirebaseCrudStore<T> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateReviewableContent: action.bound,
    });
  }

  updateReviewableContent(path: string, key: RecursiveKeyOf<T>, value: any) {
    // Update Review
    const reviewableKey = `${key as string}_review`;
    let review: Review = getValueByNestedKey(this.data, reviewableKey);
    if (!review) {
      review = new Review(this.rootStore.authStore.fullName);
    }
    review.updateTime = new Date().getTime();
    review.updatedBy = this.rootStore.authStore.fullName;

    // Update Review when value is reverted to original
    let isChangeReverted = false;
    if (review.lastReviewed === undefined) {
      review.lastReviewed = getValueByNestedKey(this.data, key);
    } else {
      if (review.lastReviewed === value) {
        isChangeReverted = true;
      }
    }

    const updateObject = {
      [key]: value,
      [reviewableKey]: review,
    };

    // Make sure that there is a UUID attached
    const uuidKey = `${key as string}_uuid`;
    const uuid = getValueByNestedKey(this.data, `${key as string}_uuid`);
    if (!uuid) {
      updateObject[uuidKey] = generateUuid();
    }

    const hugoSymbol = path.split('/')[1];
    if (!hugoSymbol) {
      return Promise.reject(new Error('Cannot update when hugoSymbol is undefined'));
    }

    return update(ref(this.db, path), updateObject).then(() => {
      if (isChangeReverted) {
        remove(ref(this.db, `${path}/${reviewableKey}/lastReviewed`));
      }
      // Update Meta information
      this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, !isChangeReverted);
    });
  }
}
