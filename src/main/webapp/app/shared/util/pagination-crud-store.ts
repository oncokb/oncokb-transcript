import axios, { AxiosResponse } from 'axios';
import { IRootStore } from 'app/stores';
import BaseCrudStore from 'app/shared/util/base-crud-store';
import _ from 'lodash';

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
  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore, apiUrl, settings);
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
}

export default PaginationCrudStore;
