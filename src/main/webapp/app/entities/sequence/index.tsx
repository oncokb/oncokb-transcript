import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Sequence from './sequence';
import SequenceDetail from './sequence-detail';
import SequenceUpdate from './sequence-update';
import SequenceDeleteDialog from './sequence-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SequenceUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SequenceDetail} />
      <ErrorBoundaryRoute path={match.url} component={Sequence} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={SequenceDeleteDialog} />
  </>
);

export default Routes;
