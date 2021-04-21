import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Info from './info';
import InfoDetail from './info-detail';
import InfoUpdate from './info-update';
import InfoDeleteDialog from './info-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={InfoUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={InfoUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={InfoDetail} />
      <ErrorBoundaryRoute path={match.url} component={Info} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={InfoDeleteDialog} />
  </>
);

export default Routes;
