import { getFirebaseRangesPath } from 'app/shared/util/firebase/firebase-utils';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';

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
    return await this.firebaseRepository.push(getFirebaseRangesPath(isGermline, hugoSymbol), {
      alias,
      start,
      end,
      oncogencities: oncogenicities.join(','),
      mutationTypes: mutationTypes.join(','),
    });
  };

  deleteRange = async (hugoSymbol: string, rangeId: string, isGermline: boolean) => {
    const rangePath = getFirebaseRangesPath(isGermline, hugoSymbol);
    return await this.firebaseRepository.deleteFromArray(rangePath, [rangeId]);
  };

  updateRange = async (
    hugoSymbol: string,
    rangeId: string,
    alias: string,
    start: number,
    end: number,
    oncogenicities: string[],
    mutationTypes: string[],
    isGermline: boolean,
  ) => {
    return await this.firebaseRepository.update(`${getFirebaseRangesPath(isGermline, hugoSymbol)}/${rangeId}`, {
      alias,
      start,
      end,
      oncogencities: oncogenicities.join(','),
      mutationTypes: mutationTypes.join(','),
    });
  };
}
