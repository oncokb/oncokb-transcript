import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/cancer-types';
const apiSearchUrl = 'api/_search/cancer-types';

export class CancerTypeStore extends PaginationCrudStore<ICancerType> {
  searchEntities: ICrudSearchAction<ICancerType> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    const result = yield axios.get<ICancerType[]>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default CancerTypeStore;
