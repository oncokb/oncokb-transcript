import { Gene, GeneTypeString, TUMOR_SUPPRESSOR } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from '../createStore';
import { action, makeObservable, override } from 'mobx';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { RecursiveKeyOf } from 'app/shared/util/firebase/firebase-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

export class FirebaseGeneStore extends FirebaseReviewableCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      updateGeneType: action.bound,
    });
  }

  updateGeneType(path: string, type: GeneTypeString, isChecked: boolean) {
    return this.updateReviewableContent(path, type === TUMOR_SUPPRESSOR ? 'type/tsg' : 'type/ocg', isChecked ? type : '');
  }

  override updateReviewableContent(path: string, key: RecursiveKeyOf<Gene>, value: any) {
    try {
      return super.updateReviewableContent(path, key, value);
    } catch (error) {
      notifyError(error, `Could not update ${key} at location ${path}`);
    }
  }
}
