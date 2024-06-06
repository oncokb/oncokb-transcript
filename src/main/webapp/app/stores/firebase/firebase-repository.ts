import { push, ref, remove, runTransaction, set, update, get } from 'firebase/database';
import FirebaseAppStore from './firebase-app.store';

export class FirebaseRepository {
  private firebaseAppStore: FirebaseAppStore;

  constructor(firebaseAppStore: FirebaseAppStore) {
    this.firebaseAppStore = firebaseAppStore;
  }

  create = async (path: string, value: unknown) => {
    return await set(ref(this.firebaseAppStore.firebaseDb, path), value);
  };

  get = async (path: string) => {
    return await get(ref(this.firebaseAppStore.firebaseDb, path));
  };

  update = async (path: string, value: any) => {
    return await update(ref(this.firebaseAppStore.firebaseDb, path), value);
  };

  delete = async (path: string) => {
    return await remove(ref(this.firebaseAppStore.firebaseDb, path));
  };

  push = async (path: string, value: any) => {
    const listRef = ref(this.firebaseAppStore.firebaseDb, path);
    const newItemRef = push(listRef);
    return await set(newItemRef, value);
  };

  pushMultiple = async (path: string, items: any[]) => {
    const listRef = ref(this.firebaseAppStore.firebaseDb, path);
    const pushUpdates = {};
    items.forEach(item => {
      const postKey = push(listRef).key;
      pushUpdates[postKey] = item;
    });
    return await update(listRef, pushUpdates);
  };

  pushToArray = async (path: string, values: any[]) => {
    return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: any[]) => {
      if (!currentData) {
        return values;
      }
      currentData.push(...values);
      return currentData;
    });
  };

  deleteFromArray = async (path: string, indices: number[]) => {
    return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: any[]) => {
      const newData = [];
      for (let i = 0; currentData !== null && i < currentData.length; i++) {
        if (!indices.includes(i)) {
          newData.push(currentData[i]);
        }
      }
      return newData;
    });
  };
}
