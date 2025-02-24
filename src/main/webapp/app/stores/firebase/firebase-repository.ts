import { push, ref, remove, set, update, get, Database } from 'firebase/database';
import FirebaseAppStore from './firebase-app.store';
import { SentryError } from 'app/config/sentry-error';

export const throwMissingFirebaseDBError = () => {
  throw new Error('No firebaseDb');
};

export class FirebaseRepository {
  private firebaseAppStore: FirebaseAppStore;

  constructor(firebaseAppStore: FirebaseAppStore) {
    this.firebaseAppStore = firebaseAppStore;
  }

  create = async (path: string, value: unknown) => {
    if (this.firebaseAppStore.firebaseDb) {
      return await set(ref(this.firebaseAppStore.firebaseDb, path), value);
    } else {
      throwMissingFirebaseDBError();
    }
  };

  get = async (path: string) => {
    return await get(ref(this.firebaseAppStore.firebaseDb as Database, path));
  };

  update = async (path: string, value: any) => {
    if (this.firebaseAppStore.firebaseDb) {
      return await update(ref(this.firebaseAppStore.firebaseDb, path), value);
    } else {
      throwMissingFirebaseDBError();
    }
  };

  delete = async (path: string) => {
    if (this.firebaseAppStore.firebaseDb) {
      return await remove(ref(this.firebaseAppStore.firebaseDb, path));
    } else {
      throwMissingFirebaseDBError();
    }
  };

  /**
   * Add an item to firebase array (object structure)
   * @param path The path to the array
   * @param value the array item to add
   * @param setValue if true, then changes will be commited to firebase. If false, then an object is returned (useful for multi-location updates)
   */
  push = async (path: string, value: any, setValue = true) => {
    if (this.firebaseAppStore.firebaseDb) {
      const listRef = ref(this.firebaseAppStore.firebaseDb, path);
      const newItemRef = push(listRef);
      if (setValue) {
        return await set(newItemRef, value);
      }
      const fullPath = `${path}/${newItemRef.key}`;
      return Promise.resolve({ pushUpdateObject: { [fullPath]: value }, pushKey: newItemRef.key });
    } else {
      throwMissingFirebaseDBError();
    }
  };

  deleteFromArray = async (arrayPath: string, arrayKeysToDelete: string[], commit = true) => {
    if (this.firebaseAppStore.firebaseDb) {
      const rootRef = ref(this.firebaseAppStore.firebaseDb, '/');
      const updateObject = arrayKeysToDelete.reduce(
        (acc, key) => {
          acc[`${arrayPath}/${key}`] = null;
          return acc;
        },
        {} as Record<string, null>,
      );
      if (commit) {
        return await set(rootRef, updateObject);
      }
      return Promise.resolve({ updateObject });
    } else {
      throwMissingFirebaseDBError();
    }
  };

  // pushMultiple = async (path: string, items: unknown[]) => {
  //   if (this.firebaseAppStore.firebaseDb) {
  //     const listRef = ref(this.firebaseAppStore.firebaseDb, path);
  //     const pushUpdates = {};
  //     items.forEach(item => {
  //       const postKey = push(listRef).key;
  //       if (postKey !== null) {
  //         pushUpdates[postKey] = item;
  //       }
  //     });
  //     return await update(listRef, pushUpdates);
  //   } else {
  //     throwMissingFirebaseDBError();
  //   }
  // };

  // pushToArray = async (path: string, values: any[]) => {
  //   if (this.firebaseAppStore.firebaseDb) {
  //     return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: any[]) => {
  //       if (!currentData) {
  //         return values;
  //       }
  //       currentData.push(...values);
  //       return currentData;
  //     });
  //   } else {
  //     throwMissingFirebaseDBError();
  //   }
  // };

  // deleteFromArray = async (path: string, indices: number[]) => {
  //   if (this.firebaseAppStore.firebaseDb) {
  //     return await runTransaction(ref(this.firebaseAppStore.firebaseDb, path), (currentData: unknown[]) => {
  //       const newData: unknown[] = [];
  //       for (let i = 0; currentData !== null && i < currentData.length; i++) {
  //         if (!indices.includes(i)) {
  //           newData.push(currentData[i]);
  //         }
  //       }
  //       return newData;
  //     });
  //   } else {
  //     throwMissingFirebaseDBError();
  //   }
  // };

  getArrayKey = (path?: string) => {
    if (this.firebaseAppStore.firebaseDb) {
      if (path === '/') {
        throw new SentryError('Cannot generate an array key at root level. Please use a child reference', { path });
      }
      const reference = ref(this.firebaseAppStore.firebaseDb, path);
      // Array key cannot be null because we check if we're using the root reference already
      const arrayKey = push(reference).key!;
      return arrayKey;
    } else {
      throwMissingFirebaseDBError();
    }
  };
}
