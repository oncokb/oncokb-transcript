import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';

const apiUrl = '/api/account/reset-password';

export class PasswordResetStore extends BaseStore {
  public activationSuccess = false;
  public activationFailure = false;
  public successMessage = null;

  handlePasswordResetInit = this.readHandler(this.handlePasswordResetInitGen);

  handlePasswordResetFinish = this.readHandler(this.handlePasswordResetFinishGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      activationSuccess: observable,
      activationFailure: observable,
      successMessage: observable,
      handlePasswordResetInit: action,
      handlePasswordResetFinish: action,
      reset: action.bound,
    });
  }

  reset() {
    this.successMessage = null;
    this.activationSuccess = false;
    this.activationFailure = false;
    this.loading = false;
  }

  *handlePasswordResetInitGen(mail) {
    this.reset();
    try {
      const result: AxiosResponse = yield axios.post(`${apiUrl}/init`, mail, { headers: { ['Content-Type']: 'text/plain' } });
      this.activationSuccess = true;
      this.successMessage = 'Check your emails for details on how to reset your password.';
      return result;
    } catch (e) {
      this.activationFailure = true;
      throw e;
    }
  }

  *handlePasswordResetFinishGen({ key, newPassword }) {
    this.reset();
    try {
      const result: AxiosResponse = yield axios.post(`${apiUrl}/finish`, { key, newPassword });
      this.activationSuccess = true;
      this.successMessage = "Your password couldn't be reset. Remember a password request is only valid for 24 hours.";
      return result;
    } catch (e) {
      this.activationFailure = true;
      throw e;
    }
  }
}

export default PasswordResetStore;
