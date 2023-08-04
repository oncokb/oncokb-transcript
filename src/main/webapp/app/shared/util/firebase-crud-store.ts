import { IRootStore } from 'app/stores';
import { Database, onValue, push, ref, set, update } from 'firebase/database';
import { action, autorun, makeObservable, observable } from 'mobx';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

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

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

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
    this.update(path, null);
  }
}
