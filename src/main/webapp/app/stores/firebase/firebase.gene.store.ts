import { Gene } from 'app/shared/model/firebase/firebase.model';
import { FirebaseCrudStore } from 'app/shared/util/firebase-crud-store';
import { IRootStore } from '../createStore';

export class FirebaseGeneStore extends FirebaseCrudStore<Gene> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
  }
}
