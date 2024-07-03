import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import FdaSubmissionType from './fda-submission-type';
import FdaSubmissionTypeDetail from './fda-submission-type-detail';
import FdaSubmissionTypeUpdate from './fda-submission-type-update';
import FdaSubmissionTypeDeleteDialog from './fda-submission-type-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={FdaSubmissionTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={FdaSubmissionTypeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={FdaSubmissionTypeDetail} />
      <ErrorBoundaryRoute path={match.url} component={FdaSubmissionType} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={FdaSubmissionTypeDeleteDialog} />
  </>
);

export default Routes;
