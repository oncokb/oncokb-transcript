import axios, { AxiosResponse } from 'axios';
import { IRootStore } from 'app/stores';
import BaseCrudStore from 'app/shared/util/base-crud-store';
import _ from 'lodash';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { ENTITY_INFO, ENTITY_RESOURCE_PATH, ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export const debouncedSearchWithPagination = _.debounce(
  (query: string, page, size, sort, searchEntities) => {
    if (query && query.length > 2) {
      return searchEntities({
        query,
        page,
        size,
        sort,
      });
    } else {
      return null;
    }
  },
  1000,
  { leading: true }
);

export class PaginationCrudStore<T> extends BaseCrudStore<T> {
  searchEntities: ICrudSearchAction<T> = this.updateHandler(this.getSearch);

  constructor(protected rootStore: IRootStore, protected entityType: ENTITY_TYPE, protected settings = { clearOnUnobserved: false }) {
    super(rootStore, getEntityResourcePath(entityType), settings);
  }

  *getAll({ page, size, sort }) {
    this.lastUrl = `${this.apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    return yield* this.getAllFromLastUrl();
  }

  *getAllFromLastUrl() {
    const result: AxiosResponse<T[]> = yield axios.get(`${this.lastUrl}${this.lastUrl.includes('?') ? '&' : '?'}cacheBuster=${Date.now()}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }

  *getSearch({ query }) {
    const result = yield axios.get<T[]>(`${this.apiUrl}/search?query=${query}`);
    this.entities = result.data;
    this.totalItems = result.data.length;
    return result;
  }
}

export default PaginationCrudStore;
