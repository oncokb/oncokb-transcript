import { getFirebaseRangesPath } from 'app/shared/util/firebase/firebase-utils';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';

/* eslint-disable no-console */
export class FirebaseRangeService {
  firebaseRepository: FirebaseRepository;

  constructor(firebaseRepository: FirebaseRepository) {
    this.firebaseRepository = firebaseRepository;
  }

  addRange = async (
    hugoSymbol: string,
    alias: string,
    start: number,
    end: number,
    oncogenicities: string[],
    mutationTypes: string[],
    isGermline: boolean,
  ) => {
    await this.firebaseRepository.push(getFirebaseRangesPath(isGermline, hugoSymbol), {
      alias,
      start,
      end,
      oncogencities: oncogenicities.join(','),
      mutationTypes: mutationTypes.join(','),
    });
  };
}
