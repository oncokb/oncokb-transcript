import { action, computed, makeObservable, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores/createStore';
import { OncoKBError } from 'app/oncokb-commons/components/alert/ErrorAlertUtils';
import { AUTHORITIES } from 'app/config/constants';

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
  public account: any = {};
  public redirectMessage: string = null;
  public logoutUrl: string = null;
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
  }

  resetBase() {
    this.isAuthenticated = false;
    this.account = {};
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
    const authorizedRoles = [AUTHORITIES.ADMIN, AUTHORITIES.USER];
    return hasAnyAuthority(this.account.authorities, authorizedRoles);
  }

  *logoutGen() {
    try {
      this.reset();
      const result: AxiosResponse = yield axios.post('/api/logout', {});
      this.logoutUrl = result.data.logoutUrl;
      return result;
    } catch (e) {
      this.errorMessage = e.message;
      throw e;
    }
  }

  *getSessionGen() {
    try {
      this.fetchingSession = true;
      const result: AxiosResponse = yield axios.get('/api/account');
      this.account = result.data;
      this.isAuthenticated = !!result.data;
      this.fetchingSession = false;
      return result;
    } catch (e) {
      this.isAuthenticated = false;
      this.fetchingSession = false;
      this.loginError = e;
      throw e;
    }
  }
}

export default AuthStore;
