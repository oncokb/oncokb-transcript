import { RouterStore as BaseRouterStore } from '@superwf/mobx-react-router';

export class RouterStore extends BaseRouterStore {
  constructor(history) {
    super(history);
  }
}

export default RouterStore;
