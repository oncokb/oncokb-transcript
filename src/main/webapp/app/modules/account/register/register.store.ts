import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';
import { responseSuccess } from 'app/config/notification-middleware-mobx';

export class RegisterStore extends BaseStore {
  public registrationSuccess = false;
  public registrationFailure = false;
  public successMessage = null;

  handleRegister = this.readHandler(this.handleRegisterGen);

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      registrationSuccess: observable,
      registrationFailure: observable,
      successMessage: observable,
      handleRegister: action,
      reset: action.bound,
    });
  }

  reset() {
    this.loading = false;
    this.registrationSuccess = false;
    this.registrationFailure = false;
    this.errorMessage = null;
    this.successMessage = null;
  }

  *handleRegisterGen({ login, email, password, langKey = 'en' }) {
    this.reset();
    this.loading = true;
    try {
      const result: AxiosResponse = yield axios.post('/api/register', { login, email, password, langKey });
      this.registrationSuccess = true;
      this.loading = false;
      this.successMessage = 'Registration saved! Please check your email for confirmation.';
      return result;
    } catch (e) {
      this.registrationFailure = true;
      this.loading = false;
      this.errorMessage = e.response.data.errorKey;
      throw e;
    }
  }
}

export default RegisterStore;
