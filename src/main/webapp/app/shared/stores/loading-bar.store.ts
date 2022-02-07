import { action, observable, makeObservable } from 'mobx';

export class LoadingBarStore {
  public count = 0;

  constructor() {
    makeObservable(this, {
      count: observable,
      showLoading: action.bound,
      hideLoading: action.bound,
    });
  }

  showLoading() {
    return ++this.count;
  }

  hideLoading() {
    return (this.count = Math.max(0, this.count - 1));
  }
}

export default LoadingBarStore;
