import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import DrugPriority from './drug-priority';
import DrugPriorityDetail from './drug-priority-detail';
import DrugPriorityUpdate from './drug-priority-update';
import DrugPriorityDeleteDialog from './drug-priority-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={DrugPriorityUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={DrugPriorityUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={DrugPriorityDetail} />
      <ErrorBoundaryRoute path={match.url} component={DrugPriority} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={DrugPriorityDeleteDialog} />
  </>
);

export default Routes;
