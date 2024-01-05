import { UsersCollection } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';

export class FirebaseUsersStore extends FirebaseCrudStore<UsersCollection> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
  }
}
