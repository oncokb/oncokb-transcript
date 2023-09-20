import { Gene, GeneTypeString, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { action, makeObservable } from 'mobx';

export class FirebaseGeneStore extends FirebaseReviewableCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateGeneType: action.bound,
    });
  }

  updateGeneType(path: string, type: GeneTypeString, isChecked: boolean) {
    this.updateReviewableContent(path, type === TUMOR_SUPPRESSOR ? 'type/tsg' : 'type/ocg', isChecked ? type : '');
  }
}
