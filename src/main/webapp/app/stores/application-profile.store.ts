import { action, observable, makeObservable } from 'mobx';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores';
import axios, { AxiosResponse } from 'axios';

export class ApplicationProfileStore extends BaseStore {
  public isInProduction = true;
  public isOpenAPIEnabled = false;

  getProfile = this.readHandler(this.getProfileGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      isInProduction: observable,
      isOpenAPIEnabled: observable,
      getProfile: action,
    });
  }

  *getProfileGen() {
    const result: AxiosResponse = yield axios.get('/management/info');
    this.isInProduction = result.data.activeProfiles.includes('prod');
    this.isOpenAPIEnabled = result.data.activeProfiles.includes('api-docs');
    return result;
  }
}

export default ApplicationProfileStore;
