import { IInfo } from 'app/shared/model/info.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/infos';

export class InfoStore extends CrudStore<IInfo> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default InfoStore;
