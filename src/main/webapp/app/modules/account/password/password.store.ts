import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';

const apiUrl = '/api/account';

export class PasswordStore extends BaseStore {
  public updateFailure = false;
  public successMessage = null;

  savePassword = this.readHandler(this.savePasswordGen);
  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      updateFailure: observable,
      successMessage: observable,
      savePassword: action,
      reset: action.bound,
    });
  }

  reset() {
    this.updateFailure = false;
    this.loading = false;
    this.errorMessage = null;
    this.successMessage = null;
    this.updateSuccess = false;
  }

  *savePasswordGen(currentPassword, newPassword) {
    this.reset();
    try {
      const result: AxiosResponse = yield axios.post(`${apiUrl}/change-password`, {
        currentPassword,
        newPassword,
      });
      this.updateSuccess = true;
      this.updateFailure = false;
      this.successMessage = 'Password changed!';
      return result;
    } catch (e) {
      this.updateSuccess = false;
      this.updateFailure = true;
      this.errorMessage = 'An error has occurred! The password could not be changed.';
      throw e;
    }
  }
}

export default PasswordStore;
