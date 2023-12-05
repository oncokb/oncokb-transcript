import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { HistoryList } from 'app/shared/model/firebase/firebase.model';

export class FirebaseHistoryStore extends FirebaseCrudStore<HistoryList> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
  }
}
