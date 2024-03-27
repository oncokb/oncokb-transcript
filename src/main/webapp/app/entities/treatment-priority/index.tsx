import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import TreatmentPriority from './treatment-priority';
import TreatmentPriorityDetail from './treatment-priority-detail';
import TreatmentPriorityUpdate from './treatment-priority-update';
import TreatmentPriorityDeleteDialog from './treatment-priority-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TreatmentPriorityUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TreatmentPriorityUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TreatmentPriorityDetail} />
      <ErrorBoundaryRoute path={match.url} component={TreatmentPriority} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TreatmentPriorityDeleteDialog} />
  </>
);

export default Routes;
