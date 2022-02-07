import { IUser } from 'app/shared/model/user.model';
import { IRootStore } from 'app/shared/stores';
import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/users';
const adminUrl = 'api/admin/users';

export class UserStore extends PaginationCrudStore<IUser> {
  public roles = [];

  getRoles: ICrudGetAllAction<any> = this.readHandler(this.getAllRoles);
  getUsersAsAdmin: ICrudGetAllAction<any> = this.readHandler(this.getAllUsersAsAdmin);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);

    makeObservable(this, {
      roles: observable,
      getRoles: action,
      getUsersAsAdmin: action,
    });
  }

  *getAllRoles() {
    const result: AxiosResponse = yield axios.get(`${this.apiUrl}/authorities`);
    this.roles = result.data;
    return result;
  }

  *getAllUsersAsAdmin({ page, size, sort }) {
    const lastUrlAsAdmin = `${adminUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    const result: AxiosResponse = yield axios.get(`${lastUrlAsAdmin}${lastUrlAsAdmin.includes('?') ? '&' : '?'}cacheBuster=${Date.now()}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default UserStore;
