import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import FdaSubmission from './fda-submission';
import FdaSubmissionDetail from './fda-submission-detail';
import FdaSubmissionUpdate from './fda-submission-update';
import FdaSubmissionDeleteDialog from './fda-submission-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={FdaSubmissionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={FdaSubmissionUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={FdaSubmissionDetail} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/curate`} component={FdaSubmissionDetail} />
      <ErrorBoundaryRoute path={match.url} component={FdaSubmission} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={FdaSubmissionDeleteDialog} />
  </>
);

export default Routes;
