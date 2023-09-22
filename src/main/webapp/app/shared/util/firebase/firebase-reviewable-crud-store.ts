import { IRootStore } from 'app/stores';
import { ref, remove, update } from 'firebase/database';
import { action, makeObservable } from 'mobx';
import { Review } from '../../model/firebase/firebase.model';
import { getValueByNestedKey } from './firebase-utils';
import { FirebaseCrudStore, RecursiveKeyOf } from './firebase-crud-store';

/* eslint-disable @typescript-eslint/ban-types */
export class FirebaseReviewableCrudStore<T extends object> extends FirebaseCrudStore<T> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateReviewableContent: action.bound,
    });
  }

  updateReviewableContent(path: string, key: RecursiveKeyOf<T>, value: any) {
    const reviewableKey = `${key as string}_review`;
    let review: Review = getValueByNestedKey(this.data, reviewableKey);
    if (review === undefined) {
      review = new Review(this.rootStore.authStore.fullName);
    }
    review.updateTime = new Date().getTime();
    review.updatedBy = this.rootStore.authStore.fullName;

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
      const uuid = getValueByNestedKey(this.data, `${key as string}_uuid`);
      this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, !isChangeReverted);
    });
  }
}
