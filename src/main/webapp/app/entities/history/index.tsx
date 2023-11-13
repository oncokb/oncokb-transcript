import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import History from './history';
import HistoryDetail from './history-detail';
import HistoryUpdate from './history-update';
import HistoryDeleteDialog from './history-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={HistoryUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={HistoryUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={HistoryDetail} />
      <ErrorBoundaryRoute path={match.url} component={History} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={HistoryDeleteDialog} />
  </>
);

export default Routes;
