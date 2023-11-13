import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import AssociationCancerType from './association-cancer-type';
import AssociationCancerTypeDetail from './association-cancer-type-detail';
import AssociationCancerTypeUpdate from './association-cancer-type-update';
import AssociationCancerTypeDeleteDialog from './association-cancer-type-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={AssociationCancerTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={AssociationCancerTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={AssociationCancerTypeDetail} />
      <ErrorBoundaryRoute path={match.url} component={AssociationCancerType} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={AssociationCancerTypeDeleteDialog} />
  </>
);

export default Routes;
