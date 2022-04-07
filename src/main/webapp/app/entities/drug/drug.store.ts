import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/drugs';

export class DrugStore extends PaginationCrudStore<IDrug> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default DrugStore;
