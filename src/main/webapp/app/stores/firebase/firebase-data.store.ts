import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import { action, makeObservable, observable } from 'mobx';
import FirebaseAppStore from './firebase-app.store';

export class FirebaseDataStore<T> {
  public data: Readonly<T> | null = null;
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
    if (this.firebaseAppStore.firebaseDb) {
      const callback = (snapshot: DataSnapshot) => (this.data = snapshot.val());
      const unsubscribe = onValue(ref(this.firebaseAppStore.firebaseDb, path), action(callback));
      return unsubscribe;
    } else {
      throw new Error('No firebaseDb');
    }
  };

  fetchData = async (path: string) => {
    if (this.firebaseAppStore.firebaseDb) {
      this.data = (await get(ref(this.firebaseAppStore.firebaseDb, path))).val();
    } else {
      throw new Error('No firebaseDb');
    }
  };
}
