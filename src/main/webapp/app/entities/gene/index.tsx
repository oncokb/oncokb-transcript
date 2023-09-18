import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Gene from './gene';
import GeneDetail from './gene-detail';
import GeneUpdate from './gene-update';
import GeneDeleteDialog from './gene-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={GeneUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={GeneUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={GeneDetail} />
      <ErrorBoundaryRoute path={match.url} component={Gene} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={GeneDeleteDialog} />
  </>
);

export default Routes;
