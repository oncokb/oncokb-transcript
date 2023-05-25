import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/fda-drugs';
const apiSearchUrl = 'api/_search/fda-drugs';

export class FdaDrugStore extends PaginationCrudStore<IFdaDrug> {
  searchEntities: ICrudSearchAction<IFdaDrug> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    return yield axios.get<IFdaDrug[]>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`);
  }
}

export default FdaDrugStore;
