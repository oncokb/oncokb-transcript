import { Gene } from 'app/shared/model/firebase/firebase.model';
import { IRootStore } from '../createStore';
import { FirebaseReviewableCrudStore } from 'app/shared/util/firebase/firebase-reviewable-crud-store';
import { ExtractPathExpressions } from 'app/shared/util/firebase/firebase-crud-store';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';

export class FirebaseGeneStore extends FirebaseReviewableCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
  }

  override updateReviewableContent(path: string, key: ExtractPathExpressions<Gene>, value: any) {
    try {
      return super.updateReviewableContent(path, key, value);
    } catch (error) {
      notifyError(error, `Could not update ${key} at location ${path}`);
    }
  }
}
