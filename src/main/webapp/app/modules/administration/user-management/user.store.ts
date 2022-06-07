import { IUser } from 'app/shared/model/user.model';
import { action, observable, makeObservable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { IRootStore } from 'app/stores/createStore';

const apiUrl = 'api/admin/users';

export class UserStore extends PaginationCrudStore<IUser> {
  getUsersAsAdmin: ICrudGetAllAction<any> = this.readHandler(this.getAllUsersAsAdmin);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);

    makeObservable(this, {
      getUsersAsAdmin: action,
    });
  }

  *getAllUsersAsAdmin({ page, size, sort }) {
    const lastUrlAsAdmin = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    const result: AxiosResponse = yield axios.get(`${lastUrlAsAdmin}${lastUrlAsAdmin.includes('?') ? '&' : '?'}cacheBuster=${Date.now()}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default UserStore;
