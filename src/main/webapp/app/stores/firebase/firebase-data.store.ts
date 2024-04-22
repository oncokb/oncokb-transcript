import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import { action, makeObservable, observable } from 'mobx';
import FirebaseAppStore from './firebase-app.store';

export class FirebaseDataStore<T> {
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
    const unsubscribe = onValue(ref(this.firebaseAppStore.firebaseDb, path), action(callback));
    return unsubscribe;
  };

  fetchData = async (path: string) => {
    this.data = (await get(ref(this.firebaseAppStore.firebaseDb, path))).val();
  };
}
