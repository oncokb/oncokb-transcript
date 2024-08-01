import { action, makeObservable, observable } from 'mobx';

export class OpenMutationCollapsibleStore {
  index: number | null = null;

  constructor() {
    makeObservable(this, {
      index: observable,
      setOpenMutationCollapsibleIndex: action.bound,
    });
  }

  setOpenMutationCollapsibleIndex(index: number | null) {
    this.index = index;
  }
}
