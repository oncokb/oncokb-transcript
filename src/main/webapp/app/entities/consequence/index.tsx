import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Consequence from './consequence';
import ConsequenceDetail from './consequence-detail';
import ConsequenceUpdate from './consequence-update';
import ConsequenceDeleteDialog from './consequence-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ConsequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ConsequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ConsequenceDetail} />
      <ErrorBoundaryRoute path={match.url} component={Consequence} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ConsequenceDeleteDialog} />
  </>
);

export default Routes;
