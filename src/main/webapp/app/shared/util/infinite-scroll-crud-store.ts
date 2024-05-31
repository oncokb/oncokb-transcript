import axios, { AxiosResponse } from 'axios';
import { IRootStore } from 'app/stores';
import BaseCrudStore from './base-crud-store';
import { action, observable, makeObservable } from 'mobx';
import { loadMoreDataWhenScrolled, parseHeaderForLinks } from 'react-jhipster';
import { parseSort } from './utils';

export class InfiniteScrollCrudStore<T> extends BaseCrudStore<T> {
  public links: { [key: string]: number } = { last: 0 };

  constructor(
    protected rootStore: IRootStore,
    protected apiUrl: string,
    protected settings = { clearOnUnobserved: false },
  ) {
    super(rootStore, apiUrl, settings);

    makeObservable(this, {
      links: observable,
      resetLinks: action.bound,
    });
  }

  protected resetBase() {
    super.resetBase();
    this.resetLinks();
  }

  resetLinks() {
    this.links = { last: 0 };
  }

  *getAll({ page, size, sort }) {
    this.lastUrl = `${this.apiUrl}${sort ? `?page=${page}&size=${size}${parseSort(sort)}` : ''}`;
    return yield* this.getAllFromLastUrl();
  }

  *getAllFromLastUrl() {
    const result: AxiosResponse<T[]> = yield axios.get(this.lastUrl);
    this.links = parseHeaderForLinks(result.headers.link);
    this.entities = loadMoreDataWhenScrolled(this.entities, result.data, this.links);
    this.totalItems = parseInt(result.headers['x-total-count'], 10);
    return result;
  }
}

export default InfiniteScrollCrudStore;
