import { action, makeObservable, observable } from 'mobx';

export class OpenMutationCollapsibleStore {
  index: number = null;

  constructor() {
    makeObservable(this, {
      index: observable,
      setOpenMutationCollapsibleIndex: action.bound,
    });
  }

  setOpenMutationCollapsibleIndex(index: number) {
    this.index = index;
  }
}
