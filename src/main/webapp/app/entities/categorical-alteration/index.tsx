import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import CategoricalAlteration from './categorical-alteration';
import CategoricalAlterationDetail from './categorical-alteration-detail';
import CategoricalAlterationUpdate from './categorical-alteration-update';
import CategoricalAlterationDeleteDialog from './categorical-alteration-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={CategoricalAlterationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={CategoricalAlterationUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={CategoricalAlterationDetail} />
      <ErrorBoundaryRoute path={match.url} component={CategoricalAlteration} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={CategoricalAlterationDeleteDialog} />
  </>
);

export default Routes;
