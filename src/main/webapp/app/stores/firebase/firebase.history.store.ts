import { FirebaseCrudStore } from 'app/shared/util/firebase/firebase-crud-store';
import { IRootStore } from '../createStore';
import { History, HistoryList } from 'app/shared/model/firebase/firebase.model';
import { action, makeObservable } from 'mobx';
import { getFirebaseHistoryPath } from 'app/shared/util/firebase/firebase-utils';

export class FirebaseHistoryStore extends FirebaseCrudStore<HistoryList> {
  constructor(rootStore: IRootStore) {
    super(rootStore);
    makeObservable(this, {
      addHistory: action.bound,
    });
  }

  addHistory(hugoSymbol: string, history: History, isGermline: boolean) {
    return this.push(getFirebaseHistoryPath(isGermline, hugoSymbol), history);
  }
}
