import { IRootStore } from 'app/stores';
import { DataSnapshot, Database, onValue, push, ref, remove, runTransaction, set, update } from 'firebase/database';
import { action, autorun, makeObservable, observable } from 'mobx';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { convertNestedObject } from './firebase-utils';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// https://stackoverflow.com/questions/66621546/how-to-extract-path-expression-from-an-interface-in-typescript
export type ExtractPathExpressions<T, Sep extends string = '/'> = Exclude<
  keyof {
    [P in Exclude<keyof T, symbol> as T[P] extends any[] | readonly any[]
      ? P | `${P}/${number}` | `${P}/${number}${Sep}${Exclude<ExtractPathExpressions<T[P][number]>, keyof number | keyof string>}`
      : T[P] extends { [x: string]: any }
      ? `${P}${Sep}${ExtractPathExpressions<T[P]>}` | P
      : P]: string;
  },
  symbol
>;

export class FirebaseCrudStore<T = any> {
  public data: Readonly<T> = undefined;
  public db: Database = undefined;

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      data: observable,
      db: observable,
      addListener: action.bound,
      setDatabase: action.bound,
      create: action.bound,
      createUntemplated: action.bound,
      update: action.bound,
      updateUntemplated: action.bound,
      push: action.bound,
      pushMultiple: action.bound,
      delete: action.bound,
      deleteFromArray: action.bound,
      pushToArray: action.bound,
      pushToArrayFront: action.bound,
    });
    autorun(() => {
      this.setDatabase(rootStore.firebaseStore.firebaseDb);
    });
  }

  setDatabase(database: Database) {
    this.db = database;
  }

  addListener(path: string) {
    const callback = (snapshot: DataSnapshot) => (this.data = snapshot.val());
    const unsubscribe = onValue(ref(this.db, path), action(callback));
    return unsubscribe;
  }

  create(path: string, value: T) {
    return set(ref(this.db, path), value);
  }

  createUntemplated(path: string, value: any) {
    return set(ref(this.db, path), value);
  }

  push(path: string, value: any) {
    const listRef = ref(this.db, path);
    const newItemRef = push(listRef);
    return set(newItemRef, value);
  }

  pushMultiple(path: string, items: any[]) {
    const listRef = ref(this.db, path);
    const pushUpdates = {};
    items.forEach(item => {
      const postKey = push(listRef).key;
      pushUpdates[postKey] = item;
    });
    return update(listRef, pushUpdates);
  }

  async update(path: string, value: RecursivePartial<T>) {
    const convertValue = convertNestedObject(value);
    try {
      return await update(ref(this.db, path), convertValue);
    } catch (e) {
      notifyError(e, 'Error updating to Firebase');
    }
  }

  async updateUntemplated(path: string, value: any) {
    const convertValue = convertNestedObject(value);
    try {
      return await update(ref(this.db, path), convertValue);
    } catch (e) {
      notifyError(e, 'Error updating to Firebase');
    }
  }

  delete(path: string) {
    return remove(ref(this.db, path));
  }

  async deleteFromArray(path: string, indices: number[]) {
    return await runTransaction(ref(this.db, path), (currentData: any[]) => {
      const newData = [];
      for (let i = 0; currentData !== null && i < currentData.length; i++) {
        if (!indices.includes(i)) {
          newData.push(currentData[i]);
        }
      }
      return newData;
    });
  }

  async pushToArray(path: string, values: any[]) {
    return await runTransaction(ref(this.db, path), (currentData: any[]) => {
      if (!currentData) {
        return values;
      }
      currentData.push(...values);
      return currentData;
    });
  }

  async pushToArrayFront(path: string, values: any[]) {
    return await runTransaction(ref(this.db, path), (currentData: any[]) => {
      if (!currentData) {
        return values;
      }
      return [...values, ...currentData];
    });
  }
}
