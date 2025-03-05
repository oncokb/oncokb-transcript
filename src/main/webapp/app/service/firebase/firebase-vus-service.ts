import { EvidenceApi } from 'app/shared/api/manual/evidence-api';
import { Vus } from 'app/shared/model/firebase/firebase.model';
import { getUserFullName } from 'app/shared/util/utils';
import { AuthStore } from 'app/stores';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import _ from 'lodash';

export class FirebaseVusService {
  firebaseRepository: FirebaseRepository;
  evidenceClient: EvidenceApi;
  authStore: AuthStore;

  constructor(firebaseRepository: FirebaseRepository, evidenceClient: EvidenceApi, authStore: AuthStore) {
    this.firebaseRepository = firebaseRepository;
    this.evidenceClient = evidenceClient;
    this.authStore = authStore;
  }

  addVus = async (path: string, variants: string[]) => {
    const newVusList = variants.map(variant => {
      return new Vus(variant, this.authStore.account.email, this.authStore.fullName);
    });
    let updateObject = {};
    for (const vus of newVusList) {
      const pushResult = await this.firebaseRepository.push(path, vus, false);
      if (pushResult !== undefined) {
        updateObject = { ...updateObject, ...pushResult.pushUpdateObject };
      }
    }
    await this.firebaseRepository.update('/', updateObject);
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

  async sendVusToCore(hugoSymbol: string, vus: Vus[]) {
    await this.evidenceClient.updateVus(hugoSymbol, vus);
  }
}
