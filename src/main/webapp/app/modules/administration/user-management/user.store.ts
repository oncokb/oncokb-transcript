import { IUser } from 'app/shared/model/user.model';
import { IRootStore } from 'app/stores/createStore';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/admin/users';

export class UserStore extends CrudStore<IUser> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default UserStore;
