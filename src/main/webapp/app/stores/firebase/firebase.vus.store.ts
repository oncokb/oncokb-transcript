import { VusObjList } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';

export class FirebaseVusStore extends FirebaseCrudStore<VusObjList> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
  }
}
