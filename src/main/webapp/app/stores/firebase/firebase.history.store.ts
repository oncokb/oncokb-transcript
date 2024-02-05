import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { History, HistoryList } from 'app/shared/model/firebase/firebase.model';
import { action, makeObservable } from 'mobx';

export class FirebaseHistoryStore extends FirebaseCrudStore<HistoryList> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      addHistory: action.bound,
    });
  }

  addHistory(hugoSymbol: string, history: History) {
    return this.push(`History/${hugoSymbol}/api`, history);
  }
}
