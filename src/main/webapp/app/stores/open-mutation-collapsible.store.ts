import { action, makeObservable, observable } from 'mobx';

export class OpenMutationCollapsibleStore {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
