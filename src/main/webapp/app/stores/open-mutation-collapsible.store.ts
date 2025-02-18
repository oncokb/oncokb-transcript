import { action, makeObservable, observable } from 'mobx';

export class OpenMutationCollapsibleStore {
  listKey: string | null = null;

  constructor() {
    makeObservable(this, {
      listKey: observable,
      setOpenMutationCollapsibleListKey: action.bound,
    });
  }

  setOpenMutationCollapsibleListKey(listKey: string | null) {
    this.listKey = listKey;
  }
}
