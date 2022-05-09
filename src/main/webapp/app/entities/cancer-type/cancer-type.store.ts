import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/cancer-types';

export class CancerTypeStore extends PaginationCrudStore<ICancerType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default CancerTypeStore;