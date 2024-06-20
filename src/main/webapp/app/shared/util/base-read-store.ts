import axios, { AxiosResponse } from 'axios';
import { action, observable, onBecomeUnobserved, makeObservable } from 'mobx';
import { ICrudGetAction, ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/stores';

export abstract class BaseReadStore<T extends object> extends BaseStore {
  public entities: ReadonlyArray<T> = [];
  // TYPE-ISSUE: making this type null adds about 300 more errors
  public entity: Readonly<T> = null as any;
  public totalItems = 0;
  public lastUrl: string | null = null;

  // TYPE-ISSUE: BaseStore needs a generic type
  getEntities: ICrudGetAllAction<T> = this.readHandler(this.getAll) as any;

  getEntity: ICrudGetAction<T> = this.readHandler(this.get);

  reset = this.resetBase;

  constructor(
    protected rootStore: IRootStore,
    protected apiUrl: string,
    protected settings = { clearOnUnobserved: false },
  ) {
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
    this.entity = {} as Readonly<T>;
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

  abstract getAll({ page, size, sort }: { page: number; size: number; sort: string });

  abstract getAllFromLastUrl();

  *get(id: string | number) {
    this.resetEntity();
    const result: AxiosResponse<T> = yield axios.get(`${this.apiUrl}/${id}`);
    this.entity = result.data;
    return result;
  }

  *checkEntities() {
    yield* this.getAllFromLastUrl();
  }
}

export default BaseReadStore;
