import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Association from './association';
import AssociationDetail from './association-detail';
import AssociationUpdate from './association-update';
import AssociationDeleteDialog from './association-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={AssociationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={AssociationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={AssociationDetail} />
      <ErrorBoundaryRoute path={match.url} component={Association} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={AssociationDeleteDialog} />
  </>
);

export default Routes;
