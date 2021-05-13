import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import GeneAlias from './gene-alias';
import GeneAliasDetail from './gene-alias-detail';
import GeneAliasUpdate from './gene-alias-update';
import GeneAliasDeleteDialog from './gene-alias-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={GeneAliasUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={GeneAliasUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={GeneAliasDetail} />
      <ErrorBoundaryRoute path={match.url} component={GeneAlias} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={GeneAliasDeleteDialog} />
  </>
);

export default Routes;
