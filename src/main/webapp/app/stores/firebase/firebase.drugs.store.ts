import { Drug, DrugCollection } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { action, makeObservable, observable } from 'mobx';
import { onValue, ref } from 'firebase/database';
import { FB_COLLECTION } from 'app/config/constants/firebase';

export class FirebaseDrugsStore extends FirebaseCrudStore<Drug> {
  public drugList: DrugCollection = undefined;

  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      drugList: observable,
      addDrugListListener: action.bound,
    });
  }

  /**
   * Create a listener for the entire Drugs collection.
   */
  addDrugListListener() {
    const unsubscribe = onValue(
      ref(this.db, FB_COLLECTION.DRUGS),
      action(snapshot => {
        this.drugList = snapshot.val();
      })
    );
    return unsubscribe;
  }
}
