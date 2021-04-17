import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import TranscriptUsage from './transcript-usage';
import TranscriptUsageDetail from './transcript-usage-detail';
import TranscriptUsageUpdate from './transcript-usage-update';
import TranscriptUsageDeleteDialog from './transcript-usage-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TranscriptUsageUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TranscriptUsageUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TranscriptUsageDetail} />
      <ErrorBoundaryRoute path={match.url} component={TranscriptUsage} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TranscriptUsageDeleteDialog} />
  </>
);

export default Routes;
