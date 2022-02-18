import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';

import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores';

const apiUrl = '/api/account';

export class SettingsStore extends BaseStore {
  public updateFailure = false;
  public successMessage = null;
  saveAccountSettings = this.updateHandler(this.saveAccountSettingsGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      updateFailure: observable,
      successMessage: observable,
      saveAccountSettings: action,
      reset: action.bound,
    });
  }

  reset() {
    super.resetBase();
    this.loading = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSuccess = false;
    this.updateFailure = false;
  }

  // Actions
  *saveAccountSettingsGen(account) {
    this.reset();
    const result: AxiosResponse = yield axios.post(apiUrl, account);
    yield this.rootStore.authStore.getSession();
    this.successMessage = 'Settings saved!';

    return result;
  }
}

export default SettingsStore;
