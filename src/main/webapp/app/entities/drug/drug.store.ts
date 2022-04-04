import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/drugs';

export class DrugStore extends CrudStore<IDrug> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default DrugStore;
