import React from 'react';
import { Switch } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Sequence from './sequence';
import Transcript from './transcript';
import TranscriptUsage from './transcript-usage';
/* jhipster-needle-add-route-import - JHipster will add routes here */

const Routes = ({ match }) => (
  <div>
    <Switch>
      {/* prettier-ignore */}
      <ErrorBoundaryRoute path={`${match.url}sequence`} component={Sequence} />
      <ErrorBoundaryRoute path={`${match.url}transcript`} component={Transcript} />
      <ErrorBoundaryRoute path={`${match.url}transcript-usage`} component={TranscriptUsage} />
      {/* jhipster-needle-add-route-path - JHipster will add routes here */}
    </Switch>
  </div>
);

export default Routes;
