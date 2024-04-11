import { History } from 'app/shared/model/firebase/firebase.model';
import { getFirebaseHistoryPath } from 'app/shared/util/firebase/firebase-utils';
import { FirebaseRepository } from '../../stores/firebase/firebase-repository';

export class FirebaseHistoryService {
  firebaseRepository: FirebaseRepository;

  constructor(firebaseRepository: FirebaseRepository) {
    this.firebaseRepository = firebaseRepository;
  }

  addHistory = async (hugoSymbol: string, history: History, isGermline: boolean) => {
    return await this.firebaseRepository.push(getFirebaseHistoryPath(isGermline, hugoSymbol), history);
  };
}
