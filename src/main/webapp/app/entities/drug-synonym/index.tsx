import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import DrugSynonym from './drug-synonym';
import DrugSynonymDetail from './drug-synonym-detail';
import DrugSynonymUpdate from './drug-synonym-update';
import DrugSynonymDeleteDialog from './drug-synonym-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={DrugSynonymUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={DrugSynonymUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={DrugSynonymDetail} />
      <ErrorBoundaryRoute path={match.url} component={DrugSynonym} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={DrugSynonymDeleteDialog} />
  </>
);

export default Routes;
