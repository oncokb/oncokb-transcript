import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/drugs';
const apiSearchUrl = 'api/drugs/search';

export class DrugStore extends PaginationCrudStore<IDrug> {
  searchEntities: ICrudSearchAction<IDrug> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query }) {
    const result = yield axios.get<IDrug[]>(`${apiSearchUrl}?query=${query}`);
    this.entities = result.data;
    this.totalItems = result.data.length;
    return result;
  }
}

export default DrugStore;
