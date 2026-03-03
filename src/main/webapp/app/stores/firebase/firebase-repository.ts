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
      if (value === null && path === '/') {
        throw new SentryError('Problematic', {});
      }
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
   * @param arrayPath The path to the array
   * @param value the array item to add
   * @param commit if true, then changes will be commited to firebase
   */
  push = async (arrayPath: string, value: any, commit = true) => {
    if (this.firebaseAppStore.firebaseDb) {
      const listRef = ref(this.firebaseAppStore.firebaseDb, arrayPath);
      const newItemRef = push(listRef);
      const output: { pushKey: string | null; pushUpdateObject?: { [path: string]: any } } = { pushKey: newItemRef.key };
      if (commit) {
        await set(newItemRef, value);
      } else {
        const fullPath = `${arrayPath}/${newItemRef.key}`;
        output.pushUpdateObject = { [fullPath]: value };
      }
      return Promise.resolve(output);
    } else {
      throwMissingFirebaseDBError();
    }
  };

  /**
   *
   * @param arrayPath Path to the array (ie. Genes/BRAF/mutations)
   * @param arrayKeysToDelete keys of array elements to delete
   * @param commit if true, the change will be set. If false, then an update object will be returned
   * @returns update objects for multi-location updates if commit is false, otherwise undefined
   */
  deleteFromArray = async (arrayPath: string, arrayKeysToDelete: string[], commit = true) => {
    if (this.firebaseAppStore.firebaseDb) {
      const updateObject = arrayKeysToDelete.reduce(
        (acc, key) => {
          acc[`${arrayPath}/${key}`] = null;
          return acc;
        },
        {} as Record<string, null>,
      );
      if (commit) {
        if (arrayKeysToDelete.length > 0) {
          const rootRef = ref(this.firebaseAppStore.firebaseDb, '/');
          return await update(rootRef, updateObject);
        }
      }
      return Promise.resolve({ updateObject });
    } else {
      throwMissingFirebaseDBError();
    }
  };

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
