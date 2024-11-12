import { RouterStore as BaseRouterStore } from '@superwf/mobx-react-router';
import { GERMLINE_PATH } from 'app/config/constants/constants';
import { computed, makeObservable } from 'mobx';

export class RouterStore extends BaseRouterStore {
  constructor(history) {
    super(history);

    makeObservable(this, {
      isGermline: computed,
    });
  }

  get isGermline() {
    return this.history.location.pathname.includes(GERMLINE_PATH);
  }
}

export default RouterStore;
