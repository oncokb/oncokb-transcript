import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import CancerType from './cancer-type';
import CancerTypeDetail from './cancer-type-detail';
import CancerTypeUpdate from './cancer-type-update';
import CancerTypeDeleteDialog from './cancer-type-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={CancerTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={CancerTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={CancerTypeDetail} />
      <ErrorBoundaryRoute path={match.url} component={CancerType} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={CancerTypeDeleteDialog} />
  </>
);

export default Routes;
