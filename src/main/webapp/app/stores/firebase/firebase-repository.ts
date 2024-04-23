import { push, ref, remove, runTransaction, set, update } from 'firebase/database';
import FirebaseAppStore from './firebase-app.store';
import { convertNestedObject } from 'app/shared/util/firebase/firebase-utils';

export class FirebaseRepository {
  private firebaseAppStore: FirebaseAppStore;

  constructor(firebaseAppStore: FirebaseAppStore) {
    this.firebaseAppStore = firebaseAppStore;
  }

  create = async (path: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await set(ref(this.firebaseAppStore.firebaseDb, path), value);
  };

  update = async (path: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await update(ref(this.firebaseAppStore.firebaseDb, path), value);
  };

  delete = async (path: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await remove(ref(this.firebaseAppStore.firebaseDb, path));
  };

  push = async (path: string, value: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const listRef = ref(this.firebaseAppStore.firebaseDb, path);
    const newItemRef = push(listRef);
    return await set(newItemRef, value);
  };

  pushMultiple = async (path: string, items: any[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const listRef = ref(this.firebaseAppStore.firebaseDb, path);
    const pushUpdates = {};
    items.forEach(item => {
      const postKey = push(listRef).key;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      pushUpdates[postKey] = item;
    });
    return await update(listRef, pushUpdates);
  };

  pushToArray = async (path: string, values: any[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: any[]) => {
      if (!currentData) {
        return values;
      }
      currentData.push(...values);
      return currentData;
    });
  };

  deleteFromArray = async (path: string, indices: number[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: any[]) => {
      const newData = [];
      for (let i = 0; currentData !== null && i < currentData.length; i++) {
        if (!indices.includes(i)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          newData.push(currentData[i]);
        }
      }
      return newData;
    });
  };
}
