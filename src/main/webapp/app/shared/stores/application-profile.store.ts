import { action, observable, makeObservable } from 'mobx';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';
import axios, { AxiosResponse } from 'axios';

export class ApplicationProfileStore extends BaseStore {
  public ribbonEnv = '';
  public isInProduction = true;
  public isOpenAPIEnabled = false;

  getProfile = this.readHandler(this.getProfileGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      ribbonEnv: observable,
      isInProduction: observable,
      isOpenAPIEnabled: observable,
      getProfile: action,
    });
  }

  *getProfileGen() {
    const result: AxiosResponse = yield axios.get('/management/info');
    this.ribbonEnv = result.data['display-ribbon-on-profiles'];
    this.isInProduction = result.data.activeProfiles.includes('prod');
    this.isOpenAPIEnabled = result.data.activeProfiles.includes('api-docs');
    return result;
  }
}

export default ApplicationProfileStore;
