import { Vus } from 'app/shared/model/firebase/firebase.model';
import { getUserFullName } from 'app/shared/util/utils';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';

export class FirebaseVusService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;

  constructor(firebaseRepository: FirebaseRepository, authStore: AuthStore) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
  }

  addVus = async (path: string, variants: string[]) => {
    const newVusList = variants.map(variant => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
    });
    await this.firebaseRepository.pushMultiple(path, newVusList);
  };

  refreshVus = async (path: string, currentVus: Vus) => {
    const vusToUpdate = _.cloneDeep(currentVus);
    vusToUpdate.time.by.name = getUserFullName(this.authStore.account);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vusToUpdate.time.by.email = this.authStore.account.email;
    vusToUpdate.time.value = Date.now();

    await this.firebaseRepository.update(path, vusToUpdate);
  };

  deleteVus = async (path: string) => {
    await this.firebaseRepository.delete(path);
  };
}
