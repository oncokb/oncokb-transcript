import { Vus } from 'app/shared/model/firebase/firebase.model';
import { getUserFullName } from 'app/shared/util/utils';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { push } from 'firebase/database';
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
      return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
    });
    await this.firebaseRepository.pushMultiple(path, newVusList);
  };

  getVusUpdateObject = (path: string, variants: string[]) => {
    const newVusList = variants.map(variant => {
      return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
    });
    const updateObject = {};
    newVusList.forEach(vus => {
      const arrayKey = this.firebaseRepository.getArrayKey(path);
      updateObject[`${path}/${arrayKey}`] = vus;
    });
    return updateObject;
  };

  refreshVus = async (path: string, currentVus: Vus) => {
    const vusToUpdate = _.cloneDeep(currentVus);
    vusToUpdate.time.by.name = getUserFullName(this.authStore.account);
    vusToUpdate.time.by.email = this.authStore.account.email;
    vusToUpdate.time.value = Date.now();

    await this.firebaseRepository.update(path, vusToUpdate);
  };

  deleteVus = async (path: string) => {
    await this.firebaseRepository.delete(path);
  };
}
