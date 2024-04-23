import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import { action, makeObservable, observable } from 'mobx';
import FirebaseAppStore from './firebase-app.store';

export class FirebaseDataStore<T> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public data: Readonly<T> = undefined;
  public firebaseAppStore: FirebaseAppStore;

  constructor(firebaseAppStore: FirebaseAppStore) {
    makeObservable(this, {
      data: observable,
      addListener: action.bound,
      fetchData: action.bound,
    });
    this.firebaseAppStore = firebaseAppStore;
  }

  addListener = (path: string) => {
    const callback = (snapshot: DataSnapshot) => (this.data = snapshot.val());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const unsubscribe = onValue(ref(this.firebaseAppStore.firebaseDb, path), action(callback));
    return unsubscribe;
  };

  fetchData = async (path: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.data = (await get(ref(this.firebaseAppStore.firebaseDb, path))).val();
  };
}
