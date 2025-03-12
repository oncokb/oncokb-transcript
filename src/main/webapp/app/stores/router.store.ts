import { RouterStore as BaseRouterStore } from '@superwf/mobx-react-router';
import { GERMLINE_PATH } from 'app/config/constants/constants';
import { action, computed, makeObservable, observable } from 'mobx';

export class RouterStore extends BaseRouterStore {
  public initialPageLoadUrl = '/';
  constructor(history) {
    super(history);

    makeObservable(this, {
      isGermline: computed,
      initialPageLoadUrl: observable,
      setInitialPageLoadUrl: action.bound,
    });
  }

  get isGermline() {
    return this.location.pathname.includes(GERMLINE_PATH);
  }

  setInitialPageLoadUrl(url: string) {
    this.initialPageLoadUrl = url;
  }
}

export default RouterStore;
