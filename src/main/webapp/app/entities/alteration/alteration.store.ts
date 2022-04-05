import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/alterations';

export class AlterationStore extends PaginationCrudStore<IAlteration> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default AlterationStore;
