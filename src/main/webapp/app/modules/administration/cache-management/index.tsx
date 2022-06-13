import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import ElasticSearchManagement from './cache-management';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute path={match.url} component={ElasticSearchManagement} />
    </Switch>
  </>
);

export default Routes;
