import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Treatment from './treatment';
import TreatmentDetail from './treatment-detail';
import TreatmentUpdate from './treatment-update';
import TreatmentDeleteDialog from './treatment-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TreatmentUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TreatmentUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TreatmentDetail} />
      <ErrorBoundaryRoute path={match.url} component={Treatment} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TreatmentDeleteDialog} />
  </>
);

export default Routes;
