import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import authentication from './authentication';
import applicationProfile from './application-profile';

/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const rootReducer = {
  authentication,
  applicationProfile,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar,
};

export default rootReducer;
