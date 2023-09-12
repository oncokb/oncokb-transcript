import { IRootStore } from 'app/stores';
import { Database, onValue, push, ref, remove, set, update } from 'firebase/database';
import { action, autorun, makeObservable, observable } from 'mobx';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { Review } from '../model/firebase/firebase.model';

/* Convert a nested object into an object where the key is the path to the object.
  Example: 
    {type: {ocg: 'Oncogene}, name: 'ABL1' }
    is converted to
    {'type/ocg': 'Oncogene', 'name': 'ABL1'}
*/
const convertNestedObject = (obj: any, key: string, result: any) => {
  if (typeof obj !== 'object') {
    result[key] = obj;
    return result;
  }
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const newKey = key ? key + '/' + keys[i] : keys[i];
    convertNestedObject(obj[keys[i]], newKey, result);
  }

  return result;
};

const getValueByNestedKey = (obj: any, nestedKey: string) => {
  return nestedKey.split('/').reduce((a, b) => a[b], obj);
};

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/* eslint-disable @typescript-eslint/ban-types */
export type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends any[]
    ? `${TKey}`
    : TObj[TKey] extends object
    ? `${TKey}` | `${TKey}/${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

export class FirebaseCrudStore<T> {
  public data: Readonly<T> = undefined;
  public db: Database = undefined;

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      data: observable,
      db: observable,
      addListener: action.bound,
      setDatabase: action.bound,
      create: action.bound,
      update: action.bound,
      push: action.bound,
      delete: action.bound,
    });
    autorun(() => {
      this.setDatabase(rootStore.firebaseStore.firebaseDb);
    });
  }

  setDatabase(database: Database) {
    this.db = database;
  }

  addListener(path: string) {
    const unsubscribe = onValue(
      ref(this.db, path),
      action(snapshot => {
        this.data = snapshot.val();
      })
    );
    return unsubscribe;
  }

  create(path: string, value: T) {
    set(ref(this.db, path), value);
  }

  push(path: string, value: any) {
    const listRef = ref(this.db, path);
    const newItemRef = push(listRef);
    set(newItemRef, value);
  }

  update(path: string, value: RecursivePartial<T>) {
    const convertValue = convertNestedObject(value, '', {});
    update(ref(this.db, path), convertValue).catch(e => {
      notifyError(e, 'Error updating to Firebase');
    });
  }

  delete(path: string) {
    remove(ref(this.db, path));
  }
}

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

    update(ref(this.db, path), updateObject).then(() => {
      if (isChangeReverted) {
        remove(ref(this.db, `${path}/${reviewableKey}/lastReviewed`));
      }
    });

    // Update Meta information
    const hugoSymbol = path.split('/')[1];
    this.rootStore.firebaseMetaStore.updateGeneMetaContent(hugoSymbol);
    const uuid = getValueByNestedKey(this.data, `${key as string}_uuid`);
    this.rootStore.firebaseMetaStore.updateGeneReviewUuid(hugoSymbol, uuid, !isChangeReverted);
  }
}
