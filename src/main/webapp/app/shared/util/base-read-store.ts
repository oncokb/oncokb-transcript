import axios, { AxiosResponse } from 'axios';
import { action, getObserverTree, observable, onBecomeUnobserved, makeObservable } from 'mobx';
import { ICrudGetAction, ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';

export abstract class BaseReadStore<T> extends BaseStore {
  public entities: ReadonlyArray<T> = [];
  public entity: Readonly<T> = null;
  public totalItems = 0;
  public lastUrl: string = null;

  getEntities: ICrudGetAllAction<T> = this.readHandler(this.getAll);

  getEntity: ICrudGetAction<T> = this.readHandler(this.get);

  reset = this.resetBase;

  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore);

    makeObservable(this, {
      entities: observable,
      entity: observable,
      totalItems: observable,
      lastUrl: observable,
      getEntities: action,
      getEntity: action,
      reset: action.bound,
      resetEntity: action.bound,
      resetEntities: action.bound,
    });

    this.reset();
    if (settings.clearOnUnobserved) {
      onBecomeUnobserved(this, 'entities', this.resetEntities);
      onBecomeUnobserved(this, 'entity', this.resetEntity);
    }
  }

  resetEntity() {
    this.entity = {} as any;
  }

  resetEntities() {
    this.entities = [];
    this.totalItems = 0;
    this.lastUrl = `${this.apiUrl}`;
  }

  protected resetBase() {
    super.resetBase();
    this.resetEntity();
    this.resetEntities();
  }

  abstract getAll({ page, size, sort });

  abstract getAllFromLastUrl();

  *get(id: string | number) {
    this.resetEntity();
    const result: AxiosResponse<T> = yield axios.get(`${this.apiUrl}/${id}`);
    this.entity = result.data;
    return result;
  }

  *checkEntities() {
    const { observers } = getObserverTree(this.entities);
    if (observers && observers.length) {
      yield* this.getAllFromLastUrl();
    } else {
      this.resetEntities();
    }
  }
}

export default BaseReadStore;
