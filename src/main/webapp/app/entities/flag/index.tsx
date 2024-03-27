import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Flag from './flag';
import FlagDetail from './flag-detail';
import FlagUpdate from './flag-update';
import FlagDeleteDialog from './flag-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={FlagUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={FlagUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={FlagDetail} />
      <ErrorBoundaryRoute path={match.url} component={Flag} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={FlagDeleteDialog} />
  </>
);

export default Routes;
