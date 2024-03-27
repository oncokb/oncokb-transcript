import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Transcript from './transcript';
import TranscriptDetail from './transcript-detail';
import TranscriptUpdate from './transcript-update';
import TranscriptDeleteDialog from './transcript-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TranscriptUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TranscriptUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TranscriptDetail} />
      <ErrorBoundaryRoute path={match.url} component={Transcript} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TranscriptDeleteDialog} />
  </>
);

export default Routes;
