import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Alteration from './alteration';
import AlterationDetail from './alteration-detail';
import AlterationUpdate from './alteration-update';
import AlterationDeleteDialog from './alteration-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={AlterationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={AlterationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={AlterationDetail} />
      <ErrorBoundaryRoute path={match.url} component={Alteration} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={AlterationDeleteDialog} />
  </>
);

export default Routes;
