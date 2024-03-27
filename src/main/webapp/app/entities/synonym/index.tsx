import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Synonym from './synonym';
import SynonymDetail from './synonym-detail';
import SynonymUpdate from './synonym-update';
import SynonymDeleteDialog from './synonym-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SynonymUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SynonymUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SynonymDetail} />
      <ErrorBoundaryRoute path={match.url} component={Synonym} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={SynonymDeleteDialog} />
  </>
);

export default Routes;
