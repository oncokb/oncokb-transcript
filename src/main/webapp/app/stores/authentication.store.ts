import { action, computed, makeObservable, observable } from 'mobx';
import axios, { AxiosError, AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores/createStore';
import { OncoKBError } from 'app/oncokb-commons/components/alert/ErrorAlertUtils';
import { AUTHORITIES } from 'app/config/constants/constants';
import { defaultValue as USER_DEFAULT_VALUE, IUser } from 'app/shared/model/user.model';

export const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};

export class AuthStore extends BaseStore {
  public isAuthenticated = false;
  public account: IUser = USER_DEFAULT_VALUE;
  public redirectMessage: string | null = null;
  public logoutUrl: string | null = null;
  public loginSuccess = false;
  public loginError: OncoKBError | undefined = undefined; // Errors returned from server side
  public fetchingSession = false;

  getSession = this.readHandler(this.getSessionGen);

  logout = this.readHandler(this.logoutGen);

  reset = this.resetBase;

  constructor(protected rootStore: IRootStore) {
    super(rootStore);

    makeObservable(this, {
      isAuthenticated: observable,
      isAuthorized: computed,
      fullName: computed,
      account: observable,
      redirectMessage: observable,
      logoutUrl: observable,
      loginSuccess: observable,
      loginError: observable,
      getSession: action,
      reset: action.bound,
      displayAuthError: action.bound,
      clearAuthentication: action.bound,
      logout: action.bound,
      fetchingSession: observable,
    });

    this.getSession();
  }

  resetBase() {
    this.isAuthenticated = false;
    this.account = USER_DEFAULT_VALUE;
    this.redirectMessage = null;
    this.logoutUrl = null;
    this.loginSuccess = false;
    this.loginError = undefined; // Errors returned from server side
    this.loading = false;
    this.errorMessage = null;
    this.updating = false;
    this.updateSuccess = false;
    this.fetchingSession = false;
  }

  displayAuthError(message) {
    this.redirectMessage = message;
  }

  clearAuthentication(messageKey) {
    this.displayAuthError(messageKey);

    this.loading = false;
    this.isAuthenticated = false;
  }

  get isAuthorized() {
    return this.isAuthenticated && this.account.authorities?.length !== 0;
  }

  get fullName() {
    return this.account.firstName + ' ' + this.account.lastName;
  }

  *logoutGen() {
    try {
      this.reset();
      this.rootStore.firebaseAppStore.signOutFromFirebase();
      const result: AxiosResponse = yield axios.post('/api/logout', {});
      this.logoutUrl = result.data.logoutUrl;
      return result;
    } catch (e) {
      this.errorMessage = (e as Error).message;
      throw e as Error;
    }
  }

  *getSessionGen() {
    if (this.isAuthenticated) {
      return this.account;
    }
    try {
      this.loading = true;
      this.fetchingSession = true;
      const result: AxiosResponse = yield axios.get('/api/account');
      this.account = result.data;
      this.isAuthenticated = !!result.data;
      this.fetchingSession = false;
      this.loading = false;
      return result;
    } catch (e) {
      this.isAuthenticated = false;
      this.fetchingSession = false;
      this.loginError = e as Error;
      this.loading = false;
      if (!axios.isAxiosError(e) || (e as AxiosError).response?.status !== 401) {
        throw e;
      }
    }
  }
}

export default AuthStore;
